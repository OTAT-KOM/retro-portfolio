<?php
session_start();

// Change this password!
define('ADMIN_PASSWORD', 'admin123');

function checkLogin() {
    if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
        header('Location: login.php');
        exit;
    }
}
?>
