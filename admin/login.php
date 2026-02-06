<?php
session_start();
// Define password here too if auth.php is not included, but it's better to include auth.php.
// However, auth.php redirects if not logged in, which we don't want here.
// So we just define the password here or check it.
// Let's just define it here to be safe and simple or modify auth.php.
// Actually, let's just hardcode it here or include a config.
define('ADMIN_PASSWORD', 'Marwan123@kom321');

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $password = $_POST['password'] ?? '';
    if ($password === ADMIN_PASSWORD) {
        $_SESSION['logged_in'] = true;
        header('Location: index.php');
        exit;
    } else {
        $error = 'Invalid password';
    }
}
?>
<!DOCTYPE html>
<html>
<head>
    <title>Admin Login</title>
    <style>
        body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background: #f0f0f0; margin: 0; }
        .login-box { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); width: 300px; }
        h2 { text-align: center; margin-top: 0; }
        input { padding: 12px; margin: 10px 0; width: 100%; box-sizing: border-box; border: 1px solid #ddd; border-radius: 4px; }
        button { padding: 12px; width: 100%; background: #007bff; color: white; border: none; cursor: pointer; border-radius: 4px; font-size: 16px; }
        button:hover { background: #0056b3; }
        .error { color: red; text-align: center; font-size: 14px; }
    </style>
</head>
<body>
    <div class="login-box">
        <h2>OTAT Admin</h2>
        <?php if ($error): ?><p class="error"><?php echo $error; ?></p><?php endif; ?>
        <form method="post">
            <input type="password" name="password" placeholder="Password" required>
            <button type="submit">Login</button>
        </form>
    </div>
</body>
</html>
