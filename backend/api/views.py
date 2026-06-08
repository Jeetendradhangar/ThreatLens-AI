from rest_framework.decorators import api_view, throttle_classes
from rest_framework.response import Response
from rest_framework import status
from django.http import JsonResponse
from rest_framework.views import exception_handler
from rest_framework.exceptions import Throttled
from api.models import Scan, ScanSignal, ThreatApiResult, Feedback
from api.serializers import ScanSerializer, ScanListSerializer, FeedbackSerializer
from api.services.scanner import extract_url_signals
from api.services.risk_engine import calculate_risk
from api.services.threat_intel import check_threat_apis

def custom_exception_handler(exc, context):
    """
    Custom DRF exception handler to map throttling and other errors to a unified 'error' format.
    """
    response = exception_handler(exc, context)
    if response is not None:
        if isinstance(exc, Throttled):
            response.data = {
                "error": f"Rate limit exceeded. Please wait {int(exc.wait)} seconds before scanning again."
            }
        elif "detail" in response.data:
            response.data["error"] = response.data.pop("detail")
    return response


def root_check(request):
    return JsonResponse({"status": "ThreatLens AI backend running", "version": "1.0.0"})


@api_view(['GET'])
@throttle_classes([])
def health_check(request):
    return Response({"status": "ok"})


@api_view(['POST'])
def scan_url(request):
    input_value = request.data.get("input_value", "").strip()
    if not input_value:
        return Response({"error": "input_value is required and cannot be empty."}, status=status.HTTP_400_BAD_REQUEST)
    if len(input_value) > 2048:
        return Response({"error": "input_value exceeds maximum length of 2048 characters."}, status=status.HTTP_400_BAD_REQUEST)

    scan_data = extract_url_signals(input_value)
    risk_data = calculate_risk(scan_data["signals"])
    
    # Priority 3: Pass ip_address to check_threat_apis
    api_results = check_threat_apis(
        scan_data["normalized_url"],
        scan_data["domain"] or "",
        scan_data["ip_address"]
    )

    # Boost score if any API returns malicious
    for r in api_results:
        if r["status"] == "malicious":
            risk_data["risk_score"] = min(risk_data["risk_score"] + 40, 100)
            risk_data["threat_level"] = "Dangerous"
            risk_data["confidence"] = "High"
            risk_data["summary"] = "External reputation source confirmed this URL as malicious."
            risk_data["recommendation"] = "Do not open or interact with this URL. It has been confirmed as malicious by an external threat intelligence source."

    scan = Scan.objects.create(
        input_value=input_value,
        normalized_url=scan_data["normalized_url"],
        domain=scan_data["domain"],
        ip_address=scan_data["ip_address"],
        risk_score=risk_data["risk_score"],
        threat_level=risk_data["threat_level"],
        confidence=risk_data["confidence"],
        summary=risk_data["summary"],
        recommendation=risk_data["recommendation"],
    )

    for sig in scan_data["signals"]:
        ScanSignal.objects.create(
            scan=scan,
            signal_name=sig["signal_name"],
            severity=sig["severity"],
            points=sig["points"],
            explanation=sig["explanation"]
        )

    for api_r in api_results:
        ThreatApiResult.objects.create(
            scan=scan,
            provider=api_r["provider"],
            status=api_r["status"],
            raw_summary=api_r.get("raw_summary", "")
        )

    serializer = ScanSerializer(scan)
    return Response(serializer.data, status=status.HTTP_201_CREATED)



@api_view(['GET'])
def scan_list(request):
    scans = Scan.objects.all().order_by('-scanned_at')[:50]
    serializer = ScanListSerializer(scans, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def scan_detail(request, scan_id):
    try:
        scan = Scan.objects.prefetch_related('signals', 'api_results').get(id=scan_id)
    except Scan.DoesNotExist:
        return Response({"error": f"Scan with id {scan_id} not found."}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = ScanSerializer(scan)
    return Response(serializer.data)


