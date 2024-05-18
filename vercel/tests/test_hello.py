import codefast as cf
import pytest


@pytest.mark.parametrize("message, expected_response", [("world", {
    "message": "Hello world"
})])
def test_hello_endpoint(message, expected_response):
    api = 'https://vercel.ddot.cc'

    # Make the API call
    resp = cf.net.post(api + '/hello', json={'message': message})

    # Assert the response
    assert resp.status_code == 200
    assert resp.json() == expected_response
