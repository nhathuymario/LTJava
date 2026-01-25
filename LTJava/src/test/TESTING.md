## Selenium Tests

### Prerequisites
- Backend running
- Frontend running
- Chrome installed

### Run
```bash
export TEST_USERNAME=lecturer01(tk)
export TEST_PASSWORD=******(mk)
mvn -Dtest=AuthSessionTest test

[//]: # (Hoặc tạo file run-selenium-ps1)
$env:TEST_USERNAME="tk"
$env:TEST_PASSWORD="mk"

mvn -Dtest=AuthSessionTest test

[//]: # (Sau đó chạy terminal )

.\run-selenium.ps1
