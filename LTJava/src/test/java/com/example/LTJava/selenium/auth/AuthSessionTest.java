package com.example.LTJava.selenium.auth;

import com.example.LTJava.selenium.base.BaseSeleniumTest;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

import static org.junit.jupiter.api.Assertions.*;

public class AuthSessionTest extends BaseSeleniumTest {

    @Test
    void KEY_AUTH_LOGIN_SUCCESS_hasToken() {
        loginValid();
        String token = getToken();
        assertNotNull(token, "Token phải tồn tại sau login");
        assertFalse(token.isBlank(), "Token không được rỗng");
    }

    @Test
    void KEY_AUTH_LOGIN_FAIL_showError_noToken() {
        clearToken();
        driver.get(BASE_URL + "/login");

        WebElement userInput = waitVisible(By.cssSelector("input.uth-input[placeholder='Tên người dùng']"));
        WebElement passInput = waitVisible(By.cssSelector("input.uth-input[type='password'][placeholder='Mật khẩu']"));
        WebElement submitBtn = waitVisible(By.cssSelector("button.uth-button[type='submit']"));

        userInput.clear();
        userInput.sendKeys("wrong-user");

        passInput.clear();
        passInput.sendKeys("wrong-pass");

        submitBtn.click();

        // Login fail của bạn render: <div className="uth-alert">{error}</div>
        boolean hasError = waitS(8).until(d -> d.findElements(By.cssSelector(".uth-alert")).size() > 0);
        assertTrue(hasError, "Login fail phải hiển thị .uth-alert");
        assertTrue(getToken() == null || getToken().isBlank(), "Login fail không được set token");
        assertTrue(driver.getCurrentUrl().contains("/login"), "Login fail không được rời trang /login");
    }

    @Test
    void KEY_AUTH_LOGOUT_clearToken_redirectLogin() {
        // Dự án bạn chưa đưa code nút logout ở đâu, nên test logout sẽ phụ thuộc selector.
        // Tạm thời chỉ test: nếu xóa token thủ công thì vào route private bị đá về /login
        loginValid();

        clearToken();
        driver.get(BASE_URL + "/lecturer"); // đổi route private đúng với app bạn
        waitS(8).until(d -> d.getCurrentUrl().contains("/login"));

        assertTrue(driver.getCurrentUrl().contains("/login"));
    }

    @Test
    void KEY_AUTH_REFRESH_PERSIST_keepLogin() {
        loginValid();

        String tokenBefore = getToken();
        assertNotNull(tokenBefore);

        driver.navigate().refresh();
        waitS(8).until(d -> getToken() != null && !getToken().isBlank());

        String tokenAfter = getToken();
        assertEquals(tokenBefore, tokenAfter, "Refresh phải giữ token (nếu bạn lưu token localStorage)");
        assertFalse(driver.getCurrentUrl().contains("/login"));
    }
}
