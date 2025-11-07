from fastapi.testclient import TestClient


def test_register_success(client):
    r = client.post("/api/register", json={"login": "okuser_1", "password": "Qwerty12!"})
    assert r.status_code == 201
    assert r.json() == {"message": "user создан"}

def test_register_duplicate_login(client):
    client.post("/api/register", json={"login": "dupuser_1", "password": "Qwerty12!"})
    r2 = client.post("/api/register", json={"login": "dupuser_1", "password": "Qwerty12!"})
    assert r2.status_code == 409
    assert r2.json() == {"detail": {"code": "login_taken", "message": "Логин уже зарегистрирован"}}


def test_register_weak_password(client: TestClient):
    payload = {"login": "weak_1", "password": "aaaaaaaa"}
    r = client.post("/api/register", json=payload)
    assert r.status_code == 422, r.text
