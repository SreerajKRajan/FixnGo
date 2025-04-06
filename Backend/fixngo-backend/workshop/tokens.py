from rest_framework_simplejwt.tokens import RefreshToken

class WorkshopToken(RefreshToken):
    def __init__(self, workshop, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._create_payload(workshop)

    def _create_payload(self, workshop):
        self.payload['user_id'] = workshop.id
        self.payload['email'] = workshop.email
        self.payload['is_verified'] = workshop.is_verified
        self.payload['type'] = "workshop"