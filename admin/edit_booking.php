<?php
require_once 'auth.php';
require_once 'functions.php';
checkLogin();

$message = '';
$data = getJsonData('booking.json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data['title'] = $_POST['title'] ?? '';
    $data['instructions'] = $_POST['instructions'] ?? '';
    $data['booking_url'] = $_POST['booking_url'] ?? '';
    
    if (saveJsonData('booking.json', $data)) {
        $message = 'Saved successfully!';
    } else {
        $message = 'Error saving data.';
    }
}
?>
<!DOCTYPE html>
<html>
<head>
    <title>Edit Booking - OTAT Admin</title>
    <style>
        body { font-family: sans-serif; padding: 20px; background: #f4f6f9; margin: 0; }
        .container { max-width: 800px; margin: 40px auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .form-group { margin-bottom: 20px; }
        label { display: block; margin-bottom: 8px; font-weight: bold; color: #333; }
        input[type="text"], textarea { width: 100%; padding: 10px; box-sizing: border-box; border: 1px solid #ddd; border-radius: 4px; font-size: 16px; }
        textarea { height: 150px; resize: vertical; }
        button { padding: 12px 24px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; }
        button:hover { background: #0056b3; }
        .alert { padding: 15px; background: #d4edda; color: #155724; border-radius: 4px; margin-bottom: 20px; }
        .back-link { display: inline-block; margin-bottom: 20px; text-decoration: none; color: #666; font-size: 14px; }
        .back-link:hover { text-decoration: underline; }
        .hint { display: block; margin-top: 5px; color: #888; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <a href="index.php" class="back-link">&larr; Back to Dashboard</a>
        <h2>Edit Booking Settings</h2>
        
        <?php if ($message): ?>
            <div class="alert"><?php echo $message; ?></div>
        <?php endif; ?>
        
        <form method="post">
            <div class="form-group">
                <label>Page Title</label>
                <input type="text" name="title" value="<?php echo htmlspecialchars($data['title'] ?? ''); ?>">
            </div>
            <div class="form-group">
                <label>Instructions</label>
                <textarea name="instructions"><?php echo htmlspecialchars($data['instructions'] ?? ''); ?></textarea>
            </div>
            <div class="form-group">
                <label>Google Appointment URL</label>
                <input type="text" name="booking_url" value="<?php echo htmlspecialchars($data['booking_url'] ?? ''); ?>">
                <span class="hint">Paste your Google Calendar Appointment Schedule URL here.</span>
            </div>
            <button type="submit">Save Changes</button>
        </form>
    </div>
</body>
</html>
