from config.lambda_handler import handler


class FakeContext:
    function_name = "interviewly-api"


def function_url_event(raw_path, normalized_path):
    # Shape captured from a real Lambda Function URL invocation: rawPath keeps the
    # trailing slash, requestContext.http.path has it stripped.
    return {
        "version": "2.0",
        "routeKey": "$default",
        "rawPath": raw_path,
        "rawQueryString": "",
        "headers": {"host": "x.lambda-url.us-east-2.on.aws", "x-forwarded-proto": "https"},
        "requestContext": {
            "domainName": "x.lambda-url.us-east-2.on.aws",
            "http": {
                "method": "GET",
                "path": normalized_path,
                "protocol": "HTTP/1.1",
                "sourceIp": "1.2.3.4",
                "userAgent": "pytest",
            },
            "requestId": "test",
            "routeKey": "$default",
            "stage": "$default",
        },
        "isBase64Encoded": False,
    }


def test_function_url_trailing_slash_is_not_redirected():
    resp = handler(function_url_event("/api/roles/", "/api/roles"), FakeContext())

    # Reaches the view (and is rejected for lacking a token) instead of a 301 loop.
    assert resp["statusCode"] == 401
