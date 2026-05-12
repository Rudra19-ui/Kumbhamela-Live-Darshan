from datetime import date, time, timedelta
from decimal import Decimal

from django.core.management.base import BaseCommand
from apps.accounts.models import User
from apps.bookings.models import MandapLocation, PoojaSlot
from apps.live_stream.models import CameraFeed
from apps.marketplace.models import Product, VendorProfile
from apps.poojas.models import PoojaCategory, PoojaOffering
from apps.pundits.models import PunditProfile


class Command(BaseCommand):
    help = "Seed demo categories, locations, streams, pundits, vendors (idempotent-ish)."

    def handle(self, *args, **options):
        admin, _ = User.objects.get_or_create(
            phone="9999999999",
            defaults={
                "full_name": "Platform Admin",
                "role": "admin",
                "is_staff": True,
                "is_superuser": True,
                "is_verified": True,
            },
        )
        if not admin.is_superuser:
            admin.is_superuser = True
            admin.is_staff = True
            admin.role = "admin"
            admin.save()
        if not admin.has_usable_password():
            admin.set_password("changeme")
            admin.save(update_fields=["password"])

        cats = [
            ("Ganga Pujan", "गंगा पूजन"),
            ("Rudrabhishek", "रुद्राभिषेक"),
            ("Satyanarayan Katha", "सत्यनारायण व्रत कथा"),
            ("Mrityunjay Jaap", "मृत्युंजय जाप"),
            ("Pitru Tarpan", "पितृ तर्पण"),
            ("Durga Path", "दुर्गा पाठ"),
            ("Ganpati Pujan", "गणपति पूजन"),
            ("Kumbh Snan Sankalp", "कुंभ स्नान संकल्प"),
            ("Navgraha Puja", "नवग्रह पूजा"),
            ("Mahamrityunjay Yagya", "महामृत्युंजय यज्ञ"),
        ]
        for i, (en, hi) in enumerate(cats):
            PoojaCategory.objects.get_or_create(
                name=en,
                defaults={"name_hindi": hi, "sort_order": i, "is_active": True},
            )

        mandaps = [
            ("Sangam Ghat Mandap", "संगम घाट मंडप"),
            ("Hanuman Ghat Puja Sthal", "हनुमान घाट पूजा स्थल"),
            ("Dashashwamedh Ghat", "दशाश्वमेध घाट"),
            ("VIP Darshan Mandap", "VIP दर्शन मंडप"),
            ("Nag Vasuki Temple", "नाग वासुकी मंदिर परिसर"),
        ]
        for en, hi in mandaps:
            MandapLocation.objects.get_or_create(name=en, defaults={"name_hindi": hi, "is_active": True})

        feeds = [
            ("Main Sangam", "मुख्य संगम", "public", False),
            ("Aarti Stage", "आरती मंच", "aarti", False),
            ("Pooja Mandap", "पूजा मंडप", "pooja_mandap", True),
            ("Crowd View", "श्रद्धालु दृश्य", "crowd", False),
            ("VIP Darshan", "VIP दर्शन", "vip", True),
        ]
        for en, hi, ctype, req in feeds:
            CameraFeed.objects.get_or_create(
                name=en,
                defaults={
                    "name_hindi": hi,
                    "camera_type": ctype,
                    "requires_booking": req,
                    "stream_url_hls": "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
                    "is_active": True,
                },
            )

        cat = PoojaCategory.objects.order_by("sort_order").first()
        if cat:
            PoojaOffering.objects.get_or_create(
                name="Ganga Aarti Sankalp",
                category=cat,
                defaults={
                    "name_hindi": "गंगा आरती संकल्प",
                    "duration_minutes": 45,
                    "mode": "both",
                    "base_price": Decimal("501.00"),
                    "is_active": True,
                },
            )

        pundit_users = []
        for i in range(3):
            u, _ = User.objects.get_or_create(
                phone=f"987654321{i}",
                defaults={
                    "full_name": f"Pandit Demo {i+1}",
                    "role": "pundit",
                    "is_verified": True,
                },
            )
            pundit_users.append(u)
            PunditProfile.objects.get_or_create(
                user=u,
                defaults={
                    "specializations": ["Ganga Pujan", "Rudrabhishek"],
                    "languages_spoken": ["Hindi", "Sanskrit"],
                    "experience_years": 10 + i,
                    "description": "Experienced purohit for Kumbh rituals.",
                    "is_approved": True,
                    "rating": Decimal("4.50") + i,
                },
            )

        vendors = []
        for i in range(2):
            u, _ = User.objects.get_or_create(
                phone=f"912345678{i}",
                defaults={
                    "full_name": f"Vendor Owner {i+1}",
                    "role": "vendor",
                    "is_verified": True,
                },
            )
            vendors.append(u)
            vp, _ = VendorProfile.objects.get_or_create(
                user=u,
                defaults={
                    "shop_name": f"Sacred Shop {i+1}",
                    "shop_name_hindi": f"पवित्र दुकान {i+1}",
                    "category": "prasad",
                    "is_approved": True,
                },
            )
            Product.objects.get_or_create(
                vendor=vp,
                name="Panchamrit Prasad",
                defaults={
                    "name_hindi": "पंचामृत प्रसाद",
                    "price": Decimal("150.00"),
                    "stock_quantity": 100,
                    "is_approved": True,
                    "is_active": True,
                },
            )

        offering = PoojaOffering.objects.first()
        mandap = MandapLocation.objects.first()
        d = date.today() + timedelta(days=1)
        for pu in pundit_users:
            prof = pu.pundit_profile
            if offering:
                PoojaSlot.objects.get_or_create(
                    pundit=prof,
                    date=d,
                    start_time=time(9, 0),
                    defaults={
                        "offering": offering,
                        "end_time": time(10, 0),
                        "mode": "offline",
                        "max_bookings": 2,
                        "mandap_location": mandap,
                        "is_available": True,
                    },
                )

        self.stdout.write(self.style.SUCCESS("Seed completed. Admin phone: 9999999999 (set password via admin or OTP flow)."))
