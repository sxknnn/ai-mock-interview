from mangum import Mangum

from config.asgi import application

_mangum = Mangum(application, lifespan="off")


def handler(event, context):
    # Lambda Function URLs strip the trailing slash from requestContext.http.path
    # (rawPath keeps it), and Mangum routes on http.path — so "/api/roles/" reaches
    # Django as "/api/roles", APPEND_SLASH 301s back to "/api/roles/", forever.
    http = event.get("requestContext", {}).get("http")
    if http is not None and event.get("rawPath"):
        http["path"] = event["rawPath"]
    return _mangum(event, context)
