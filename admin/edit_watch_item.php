<?php
require_once 'auth.php';
require_once 'functions.php';
checkLogin();

$data = getJsonData('watch.json');
$items = $data['items'] ?? [];
$index = isset($_GET['index']) ? (int)$_GET['index'] : null;
$item = ($index !== null && isset($items[$index])) ? $items[$index] : [];
$isNew = ($index === null);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Handle Thumbnail Upload
    if (isset($_FILES['thumbnail']) && $_FILES['thumbnail']['error'] === UPLOAD_ERR_OK) {
        $uploadedPath = handleUpload($_FILES['thumbnail']);
        if ($uploadedPath) {
            $item['thumbnail'] = $uploadedPath;
        }
    }

    $item['title'] = $_POST['title'] ?? '';
    $item['video_url'] = $_POST['video_url'] ?? '';
    $item['description'] = $_POST['description'] ?? '';

    if ($isNew) {
        array_unshift($items, $item);
    } else {
        $items[$index] = $item;
    }
    
    $data['items'] = $items;
    saveJsonData('watch.json', $data);
    header('Location: edit_watch.php');
    exit;
}
?>
<!DOCTYPE html>
<html>
<head>
    <title><?php echo $isNew ? 'Add Video' : 'Edit Video'; ?> - OTAT Admin</title>
    <style>
        body { font-family: sans-serif; padding: 20px; background: #f4f6f9; margin: 0; }
        .container { max-width: 800px; margin: 40px auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .form-group { margin-bottom: 20px; }
        label { display: block; margin-bottom: 8px; font-weight: bold; color: #333; }
        input[type="text"], textarea, input[type="file"] { width: 100%; padding: 10px; box-sizing: border-box; border: 1px solid #ddd; border-radius: 4px; font-size: 16px; }
        textarea { height: 150px; resize: vertical; }
        button { padding: 12px 24px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; }
        button:hover { background: #0056b3; }
        .current-image { margin-top: 10px; max-width: 200px; border-radius: 4px; }
        .back-link { display: inline-block; margin-bottom: 20px; text-decoration: none; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <a href="edit_watch.php" class="back-link">&larr; Back to List</a>
        <h2><?php echo $isNew ? 'Add Video' : 'Edit Video'; ?></h2>
        
        <form method="post" enctype="multipart/form-data">
            <div class="form-group">
                <label>Title</label>
                <input type="text" name="title" value="<?php echo htmlspecialchars($item['title'] ?? ''); ?>" required>
            </div>
            
            <div class="form-group">
                <label>Video URL (YouTube/Embed or File Path)</label>
                <input type="text" name="video_url" value="<?php echo htmlspecialchars($item['video_url'] ?? ''); ?>">
            </div>

            <div class="form-group">
                <label>Thumbnail</label>
                <?php if (!empty($item['thumbnail'])): ?>
                    <img src="../<?php echo $item['thumbnail']; ?>" class="current-image"><br>
                    <small>Upload new to replace</small>
                <?php endif; ?>
                <input type="file" name="thumbnail" accept="image/*">
            </div>

            <div class="form-group">
                <label>Description</label>
                <textarea name="description"><?php echo htmlspecialchars($item['description'] ?? ''); ?></textarea>
            </div>
            
            <button type="submit">Save Video</button>
        </form>
    </div>
</body>
</html>
