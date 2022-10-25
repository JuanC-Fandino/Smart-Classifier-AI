from datetime import datetime, timezone, timedelta

from app.main import bp


@bp.app_template_filter('utc_to_local')
def utc_to_local(utc_dt: datetime) -> str:
    tz = timezone(timedelta(hours=-5))
    return utc_dt.replace(tzinfo=timezone.utc).astimezone(tz=tz).time().strftime('%H:%M')
