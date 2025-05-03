from geopy.geocoders import Nominatim
import math

def get_coordinates(address):
    """
    Get latitude and longitude for a given address using the Geopy library.
    """
    geolocator = Nominatim(user_agent="fixngo") 
    location = geolocator.geocode(address)
    if location:
        return location.latitude, location.longitude
    return None, None


def haversine(lat1, lon1, lat2, lon2):
    """
    Calculate the great-circle distance between two points on the Earth's surface.
    
    Parameters:
    - lat1, lon1: Coordinates of the first point in decimal degrees
    - lat2, lon2: Coordinates of the second point in decimal degrees
    
    Returns:
    - Distance in kilometers
    """
    if None in (lat1, lon1, lat2, lon2):
        raise ValueError("All coordinates must be valid numbers.")
    
    # Earth's radius in kilometers
    R = 6371.0  

    # Convert degrees to radians
    lat1, lon1, lat2, lon2 = map(math.radians, [float(lat1), float(lon1), float(lat2), float(lon2)])

    # Differences in coordinates
    dlat = lat2 - lat1
    dlon = lon2 - lon1

    # Haversine formula
    a = math.sin(dlat / 2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    distance = R * c

    return distance