<?php
require_once 'auth.php';
require_once 'functions.php';
checkLogin();

$data = getJsonData('events.json');
$items = $data['items'] ?? [];
$index = isset($_GET['index']) ? (int)$_GET['index'] : null;
$item = ($index !== null && isset($items[$index])) ? $items[$index] : [];
$isNew = ($index === null);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Handle Image Upload
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $uploadedPath = handleUpload($_FILES['image']);
        if ($uploadedPath) {
            $item['image'] = $uploadedPath;
        }
    }

    $item['title'] = $_POST['title'] ?? '';
    $item['date'] = $_POST['date'] ?? '';
    $item['time'] = $_POST['time'] ?? '';
    $item['location'] = $_POST['location'] ?? '';
    $item['tickets'] = $_POST['tickets'] ?? '';
    $item['body'] = $_POST['body'] ?? '';

    if ($isNew) {
        array_unshift($items, $item); // Add to top
    } else {
        $items[$index] = $item;
    }
    
    $data['items'] = $items;
    saveJsonData('events.json', $data);
    header('Location: edit_events.php');
    exit;
}
?>
<!DOCTYPE html>
<html>
<head>
    <title><?php echo $isNew ? 'Add Event' : 'Edit Event'; ?> - OTAT Admin</title>
    <style>
        body { font-family: sans-serif; padding: 20px; background: #f4f6f9; margin: 0; }
        .container { max-width: 800px; margin: 40px auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .form-group { margin-bottom: 20px; }
        label { display: block; margin-bottom: 8px; font-weight: bold; color: #333; }
        input[type="text"], input[type="date"], textarea, input[type="file"] { width: 100%; padding: 10px; box-sizing: border-box; border: 1px solid #ddd; border-radius: 4px; font-size: 16px; }
        textarea { height: 200px; resize: vertical; }
        button { padding: 12px 24px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; }
        button:hover { background: #0056b3; }
        .current-image { margin-top: 10px; max-width: 200px; border-radius: 4px; }
        .back-link { display: inline-block; margin-bottom: 20px; text-decoration: none; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <a href="edit_events.php" class="back-link">&larr; Back to Events List</a>
        <h2><?php echo $isNew ? 'Add Event' : 'Edit Event'; ?></h2>
        
        <form method="post" enctype="multipart/form-data">
            <div class="form-group">
                <label>Title</label>
                <input type="text" name="title" value="<?php echo htmlspecialchars($item['title'] ?? ''); ?>" required>
            </div>
            
            <div class="form-group">
                <label>Image</label>
                <?php if (!empty($item['image'])): ?>
                    <img src="../<?php echo $item['image']; ?>" class="current-image"><br>
                    <small>Upload new to replace</small>
                <?php endif; ?>
                <input type="file" name="image" accept="image/*">
            </div>

            <div class="form-group">
                <label>Date</label>
                <input type="date" name="date" value="<?php echo htmlspecialchars($item['date'] ?? ''); ?>">
            </div>

            <div class="form-group">
                <label>Time Range (e.g. 17:00 > 23:00)</label>
                <input type="text" name="time" value="<?php echo htmlspecialchars($item['time'] ?? ''); ?>">
            </div>

            <div class="form-group">
                <label>Location</label>
                <input type="text" name="location" value="<?php echo htmlspecialchars($item['location'] ?? ''); ?>">
            </div>

            <div class="form-group">
                <label>Tickets (e.g. Doorsale only)</label>
                <input type="text" name="tickets" value="<?php echo htmlspecialchars($item['tickets'] ?? ''); ?>">
            </div>

            <div class="form-group">
                <label>Description (Markdown)</label>
                <textarea name="body"><?php echo htmlspecialchars($item['body'] ?? ''); ?></textarea>
            </div>
            
            <button type="submit">Save Event</button>
        </form>
    </div>
</body>
</html>
