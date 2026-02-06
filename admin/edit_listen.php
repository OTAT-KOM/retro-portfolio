<?php
require_once 'auth.php';
require_once 'functions.php';
checkLogin();

$message = '';
$data = getJsonData('listen.json');
$items = $data['items'] ?? [];

// Handle Profile Save
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['save_profile'])) {
    $data['profile_name'] = $_POST['profile_name'] ?? '';
    $data['profile_summary'] = $_POST['profile_summary'] ?? '';
    $data['spotify_url'] = $_POST['spotify_url'] ?? '';
    
    if (isset($_FILES['profile_image']) && $_FILES['profile_image']['error'] === UPLOAD_ERR_OK) {
        $path = handleUpload($_FILES['profile_image']);
        if ($path) $data['profile_image'] = $path;
    }
    
    // items remain unchanged here (re-read from file just in case or assume consistency)
    // But since we just read $items from file, it's safe.
    $data['items'] = $items; 
    
    if (saveJsonData('listen.json', $data)) {
        $message = 'Profile saved successfully!';
    } else {
        $message = 'Error saving profile.';
    }
}

// Handle Track Delete
if (isset($_GET['delete'])) {
    $index = (int)$_GET['delete'];
    if (isset($items[$index])) {
        array_splice($items, $index, 1);
        $data['items'] = $items;
        saveJsonData('listen.json', $data);
        header('Location: edit_listen.php');
        exit;
    }
}
?>
<!DOCTYPE html>
<html>
<head>
    <title>Manage Listen - OTAT Admin</title>
    <style>
        body { font-family: sans-serif; padding: 20px; background: #f4f6f9; margin: 0; }
        .container { max-width: 1000px; margin: 40px auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .item-list { list-style: none; padding: 0; }
        .item-row { display: flex; align-items: center; background: white; padding: 15px; border-bottom: 1px solid #eee; }
        .item-row:last-child { border-bottom: none; }
        .item-image { width: 60px; height: 60px; object-fit: cover; margin-right: 20px; background: #eee; border-radius: 4px; }
        .item-info { flex: 1; }
        .item-actions { margin-left: 20px; display: flex; gap: 10px; }
        .btn { padding: 8px 12px; text-decoration: none; border-radius: 4px; font-size: 14px; cursor: pointer; border: none; }
        .btn-edit { background: #ffc107; color: black; }
        .btn-delete { background: #dc3545; color: white; }
        .btn-add { background: #28a745; color: white; display: inline-block; padding: 10px 20px; margin-bottom: 20px; font-weight: bold; }
        .back-link { display: inline-block; margin-bottom: 20px; text-decoration: none; color: #666; font-size: 14px; }
        h2 { margin-top: 0; }
        .section { margin-bottom: 40px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; font-weight: bold; }
        input[type="text"] { width: 100%; padding: 8px; box-sizing: border-box; border: 1px solid #ddd; border-radius: 4px; }
        .current-profile-img { width: 100px; height: 100px; object-fit: cover; border-radius: 50%; margin-top: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <a href="index.php" class="back-link">&larr; Back to Dashboard</a>
        
        <?php if ($message): ?>
            <div style="padding: 10px; background: #d4edda; color: #155724; margin-bottom: 20px; border-radius: 4px;"><?php echo $message; ?></div>
        <?php endif; ?>

        <div class="section">
            <h2>Profile Settings</h2>
            <form method="post" enctype="multipart/form-data">
                <input type="hidden" name="save_profile" value="1">
                <div class="form-group">
                    <label>Profile Name</label>
                    <input type="text" name="profile_name" value="<?php echo htmlspecialchars($data['profile_name'] ?? ''); ?>">
                </div>
                <div class="form-group">
                    <label>Profile Summary</label>
                    <input type="text" name="profile_summary" value="<?php echo htmlspecialchars($data['profile_summary'] ?? ''); ?>">
                </div>
                <div class="form-group">
                    <label>Spotify URL</label>
                    <input type="text" name="spotify_url" value="<?php echo htmlspecialchars($data['spotify_url'] ?? ''); ?>">
                </div>
                <div class="form-group">
                    <label>Profile Picture</label>
                    <?php if (!empty($data['profile_image'])): ?>
                        <img src="../<?php echo $data['profile_image']; ?>" class="current-profile-img"><br>
                    <?php endif; ?>
                    <input type="file" name="profile_image">
                </div>
                <button type="submit" class="btn" style="background: #007bff; color: white;">Save Profile</button>
            </form>
        </div>

        <div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <h2>Tracks List</h2>
                <a href="edit_listen_item.php" class="btn btn-add">+ Add New Track</a>
            </div>
            
            <?php if (empty($items)): ?>
                <p>No tracks found.</p>
            <?php else: ?>
                <div class="item-list">
                    <?php foreach ($items as $index => $item): ?>
                        <div class="item-row">
                            <?php if (!empty($item['cover'])): ?>
                                <img src="../<?php echo $item['cover']; ?>" class="item-image">
                            <?php else: ?>
                                <div class="item-image" style="display: flex; align-items: center; justify-content: center; color: #999;">No Cover</div>
                            <?php endif; ?>
                            
                            <div class="item-info">
                                <strong><?php echo htmlspecialchars($item['title'] ?? 'Untitled'); ?></strong><br>
                                <small><?php echo htmlspecialchars($item['artist'] ?? ''); ?></small>
                            </div>
                            
                            <div class="item-actions">
                                <a href="edit_listen_item.php?index=<?php echo $index; ?>" class="btn btn-edit">Edit</a>
                                <a href="?delete=<?php echo $index; ?>" class="btn btn-delete" onclick="return confirm('Are you sure?')">Delete</a>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
        </div>
    </div>
</body>
</html>
