<?php
require_once 'auth.php';
require_once 'functions.php';
checkLogin();

$data = getJsonData('listen.json');
$items = $data['items'] ?? [];
$index = isset($_GET['index']) ? (int)$_GET['index'] : null;
$item = ($index !== null && isset($items[$index])) ? $items[$index] : [];
$isNew = ($index === null);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Handle Cover Upload
    if (isset($_FILES['cover']) && $_FILES['cover']['error'] === UPLOAD_ERR_OK) {
        $uploadedPath = handleUpload($_FILES['cover']);
        if ($uploadedPath) {
            $item['cover'] = $uploadedPath;
        }
    }
    
    // Handle Audio Upload
    if (isset($_FILES['audio']) && $_FILES['audio']['error'] === UPLOAD_ERR_OK) {
        $uploadedPath = handleUpload($_FILES['audio']);
        if ($uploadedPath) {
            $item['audio'] = $uploadedPath;
        }
    }

    $item['title'] = $_POST['title'] ?? '';
    $item['artist'] = $_POST['artist'] ?? '';

    if ($isNew) {
        array_unshift($items, $item);
    } else {
        $items[$index] = $item;
    }
    
    $data['items'] = $items;
    saveJsonData('listen.json', $data);
    header('Location: edit_listen.php');
    exit;
}
?>
<!DOCTYPE html>
<html>
<head>
    <title><?php echo $isNew ? 'Add Track' : 'Edit Track'; ?> - OTAT Admin</title>
    <style>
        body { font-family: sans-serif; padding: 20px; background: #f4f6f9; margin: 0; }
        .container { max-width: 800px; margin: 40px auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .form-group { margin-bottom: 20px; }
        label { display: block; margin-bottom: 8px; font-weight: bold; color: #333; }
        input[type="text"], input[type="file"] { width: 100%; padding: 10px; box-sizing: border-box; border: 1px solid #ddd; border-radius: 4px; font-size: 16px; }
        button { padding: 12px 24px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; }
        button:hover { background: #0056b3; }
        .current-image { margin-top: 10px; max-width: 200px; border-radius: 4px; }
        .back-link { display: inline-block; margin-bottom: 20px; text-decoration: none; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <a href="edit_listen.php" class="back-link">&larr; Back to Listen List</a>
        <h2><?php echo $isNew ? 'Add Track' : 'Edit Track'; ?></h2>
        
        <form method="post" enctype="multipart/form-data">
            <div class="form-group">
                <label>Title</label>
                <input type="text" name="title" value="<?php echo htmlspecialchars($item['title'] ?? ''); ?>" required>
            </div>
            
            <div class="form-group">
                <label>Artist</label>
                <input type="text" name="artist" value="<?php echo htmlspecialchars($item['artist'] ?? ''); ?>">
            </div>

            <div class="form-group">
                <label>Cover Image</label>
                <?php if (!empty($item['cover'])): ?>
                    <img src="../<?php echo $item['cover']; ?>" class="current-image"><br>
                    <small>Upload new to replace</small>
                <?php endif; ?>
                <input type="file" name="cover" accept="image/*">
            </div>

            <div class="form-group">
                <label>Audio File</label>
                <?php if (!empty($item['audio'])): ?>
                    <div style="margin-top: 10px; margin-bottom: 5px;">
                        <audio controls src="../<?php echo $item['audio']; ?>"></audio>
                    </div>
                    <small>Upload new to replace (MP3, WAV, etc.)</small>
                <?php endif; ?>
                <input type="file" name="audio" accept="audio/*">
            </div>
            
            <button type="submit">Save Track</button>
        </form>
    </div>
</body>
</html>
