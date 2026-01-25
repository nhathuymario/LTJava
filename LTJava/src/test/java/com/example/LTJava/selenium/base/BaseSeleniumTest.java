package com.example.LTJava.selenium.base;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public abstract class BaseSeleniumTest {

    protected WebDriver driver;

    protected final String BASE_URL = System.getProperty("baseUrl", "http://localhost:5173");
    protected final String TOKEN_KEY = System.getProperty("tokenKey", "token");

    @BeforeEach
    void setup() {
        ChromeOptions options = new ChromeOptions();
        if (Boolean.parseBoolean(System.getProperty("headless", "false"))) {
            options.addArguments("--headless=new");
        }
        driver = new ChromeDriver(options);
        driver.manage().window().maximize();
        driver.manage().timeouts().implicitlyWait(Duration.ofMillis(0));
    }

    @AfterEach
    void teardown() {
        if (driver != null) driver.quit();
    }

    protected WebDriverWait waitS(long seconds) {
        return new WebDriverWait(driver, Duration.ofSeconds(seconds));
    }

    protected WebElement waitVisible(By by) {
        return waitS(10).until(ExpectedConditions.visibilityOfElementLocated(by));
    }

    protected void clearToken() {
        ((JavascriptExecutor) driver).executeScript(
                "try { window.sessionStorage.removeItem(arguments[0]); } catch(e) {}",
                TOKEN_KEY
        );
    }


    protected String getToken() {
        Object v = ((JavascriptExecutor) driver).executeScript(
                "return window.sessionStorage.getItem(arguments[0]);",
                TOKEN_KEY
        );
        return v == null ? null : String.valueOf(v);
    }


    protected String getTestUsername() {
        String v = System.getProperty("test.username");
        if (v != null && !v.isBlank()) return v;
        v = System.getenv("TEST_USERNAME");
        if (v != null && !v.isBlank()) return v;
        throw new IllegalStateException("Thiếu username: dùng -Dtest.username=... hoặc env TEST_USERNAME");
    }

    protected String getTestPassword() {
        String v = System.getProperty("test.password");
        if (v != null && !v.isBlank()) return v;
        v = System.getenv("TEST_PASSWORD");
        if (v != null && !v.isBlank()) return v;
        throw new IllegalStateException("Thiếu password: dùng -Dtest.password=... hoặc env TEST_PASSWORD");
    }

    /**
     * Selector đúng theo LoginPage bạn gửi:
     * - username: input[placeholder='Tên người dùng']
     * - password: input[type='password'][placeholder='Mật khẩu']
     * - submit:   button[type='submit']
     */
    protected void loginValid() {
        clearToken();
        driver.get(BASE_URL + "/login");

        WebElement userInput = waitVisible(By.cssSelector("input.uth-input[placeholder='Tên người dùng']"));
        WebElement passInput = waitVisible(By.cssSelector("input.uth-input[type='password'][placeholder='Mật khẩu']"));
        WebElement submitBtn = waitVisible(By.cssSelector("button.uth-button[type='submit']"));

        userInput.clear();
        userInput.sendKeys(getTestUsername());

        passInput.clear();
        passInput.sendKeys(getTestPassword());

        submitBtn.click();

        // Đợi token xuất hiện hoặc rời /login
        waitS(10).until(d -> {
            String token = getToken();
            String url = d.getCurrentUrl();
            return (token != null && !token.isBlank()) || (url != null && !url.contains("/login"));
        });
    }

    protected void sleepMs(long ms) {
        try { Thread.sleep(ms); } catch (InterruptedException ignored) {}
    }
}
