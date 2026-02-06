<?php
require_once 'auth.php';
checkLogin();
?>
<!DOCTYPE html>
<html>
<head>
    <title>OTAT Admin Dashboard</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        body { font-family: sans-serif; background: #f4f6f9; margin: 0; }
        .header { background: #343a40; color: white; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; }
        .header h1 { margin: 0; font-size: 20px; }
        .header a { color: #c2c7d0; text-decoration: none; margin-left: 15px; }
        .header a:hover { color: white; }
        .container { padding: 20px; max-width: 1200px; margin: 0 auto; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; }
        .card { background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); padding: 20px; text-align: center; transition: transform 0.2s; text-decoration: none; color: inherit; display: block; }
        .card:hover { transform: translateY(-5px); box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
        .card i { font-size: 40px; color: #007bff; margin-bottom: 15px; }
        .card h3 { margin: 0; font-size: 18px; color: #333; }
        .card p { color: #666; font-size: 14px; margin-top: 5px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>OTAT Dashboard</h1>
        <div>
            <a href="../" target="_blank"><i class="fas fa-external-link-alt"></i> View Site</a>
            <a href="logout.php"><i class="fas fa-sign-out-alt"></i> Logout</a>
        </div>
    </div>
    
    <div class="container">
        <h2>Content Management</h2>
        <div class="grid">
            <a href="edit_projects.php" class="card">
                <i class="fas fa-video"></i>
                <h3>Video Projects</h3>
                <p>Manage video projects</p>
            </a>
            <a href="edit_pictures.php" class="card">
                <i class="fas fa-images"></i>
                <h3>Gallery Pictures</h3>
                <p>Manage photo gallery</p>
            </a>
            <a href="edit_listen.php" class="card">
                <i class="fas fa-music"></i>
                <h3>Listen</h3>
                <p>Manage music tracks</p>
            </a>
            <a href="edit_booking.php" class="card">
                <i class="fas fa-calendar-check"></i>
                <h3>Booking</h3>
                <p>Booking settings</p>
            </a>
            <a href="edit_about.php" class="card">
                <i class="fas fa-info-circle"></i>
                <h3>About / Contact</h3>
                <p>About text and social links</p>
            </a>
            <a href="edit_note.php" class="card">
                <i class="fas fa-sticky-note"></i>
                <h3>Note</h3>
                <p>Homepage note</p>
            </a>
        </div>
    </div>
</body>
</html>
