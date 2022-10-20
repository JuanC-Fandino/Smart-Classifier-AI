from datetime import datetime, timezone

from app.main import bp


@bp.app_template_filter('utc_to_local')
def utc_to_local(utc_dt: datetime) -> datetime:
    return utc_dt.replace(tzinfo=timezone.utc).astimezone(tz=None).time().strftime('%H:%M')
