import socket
import ipaddress

def is_valid_ip(ip_str: str) -> bool:
    """
    Checks if a string is a valid IPv4 or IPv6 address.
    """
    if not isinstance(ip_str, str):
        return False
    try:
        ipaddress.ip_address(ip_str.strip())
        return True
    except Exception:
        return False

def resolve_hostname(hostname: str) -> str:
    """
    Safely resolves a hostname to an IP address.
    Returns None if resolution fails or times out.
    """
    if not hostname or not isinstance(hostname, str):
        return None
    try:
        clean_host = hostname.strip().strip("[]")
        socket.setdefaulttimeout(3.0)
        addr_info = socket.getaddrinfo(clean_host, None)
        if addr_info:
            # Retrieve the first resolved address
            return addr_info[0][4][0]
    except Exception:
        pass
    return None

def is_safe_ip(ip_str: str) -> bool:
    """
    Checks if the IP is public/safe to connect to.
    Blocks loopback, private, link-local, multicast, and reserved addresses.
    """
    if not ip_str:
        return False
    try:
        ip = ipaddress.ip_address(ip_str)
        
        # Block loopback (e.g. 127.0.0.0/8, ::1)
        if ip.is_loopback:
            return False
        # Block private networks (e.g. 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, fc00::/7)
        if ip.is_private:
            return False
        # Block link-local networks (e.g. 169.254.0.0/16, fe80::/10)
        if ip.is_link_local:
            return False
        # Block multicast addresses
        if ip.is_multicast:
            return False
        # Block reserved ranges
        if ip.is_reserved:
            return False
        # Block unspecified address (0.0.0.0, ::)
        if ip.is_unspecified:
            return False
            
        return True
    except ValueError:
        return False

def is_safe_url_host(hostname: str) -> tuple[bool, str]:
    """
    Checks if a host name is safe to access (SSRF protection).
    Returns a tuple of (is_safe, resolved_ip).
    """
    if not hostname:
        return False, None
        
    # Check if host is already a raw IP
    if is_valid_ip(hostname):
        return is_safe_ip(hostname), hostname
        
    # Check for localhost literally
    if hostname.lower() in ('localhost', '127.0.0.1', '::1'):
        return False, '127.0.0.1' if hostname.lower() == 'localhost' else hostname
        
    # Resolve domain to IP address
    resolved_ip = resolve_hostname(hostname)
    if not resolved_ip:
        # If we cannot resolve it, it cannot be requested, but we mark it safe
        # so the standard scanner proceeds and fails gracefully on request connection.
        return True, None
        
    return is_safe_ip(resolved_ip), resolved_ip
