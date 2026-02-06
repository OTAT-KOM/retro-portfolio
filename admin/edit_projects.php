<?php
require_once 'auth.php';
require_once 'functions.php';
checkLogin();

$data = getJsonData('projects.json');
$items = $data['items'] ?? [];

if (isset($_GET['delete'])) {
    $index = (int)$_GET['delete'];
    if (isset($items[$index])) {
        array_splice($items, $index, 1);
        $data['items'] = $items;
        saveJsonData('projects.json', $data);
        header('Location: edit_projects.php');
        exit;
    }
}
?>
<!DOCTYPE html>
<html>
<head>
    <title>Manage Projects - OTAT Admin</title>
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
    </style>
</head>
<body>
    <div class="container">
        <a href="index.php" class="back-link">&larr; Back to Dashboard</a>
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <h2>Video Projects</h2>
            <a href="edit_project_item.php" class="btn btn-add">+ Add New Project</a>
        </div>
        
        <?php if (empty($items)): ?>
            <p>No projects found.</p>
        <?php else: ?>
            <div class="item-list">
                <?php foreach ($items as $index => $item): ?>
                    <div class="item-row">
                        <?php if (!empty($item['media_src']) && ($item['media_type'] ?? '') === 'image'): ?>
                            <img src="../<?php echo $item['media_src']; ?>" class="item-image">
                        <?php elseif (!empty($item['media_src']) && ($item['media_type'] ?? '') === 'video'): ?>
                            <video src="../<?php echo $item['media_src']; ?>" class="item-image"></video>
                        <?php else: ?>
                            <div class="item-image" style="display: flex; align-items: center; justify-content: center; color: #999;">No Img</div>
                        <?php endif; ?>
                        
                        <div class="item-info">
                            <strong><?php echo htmlspecialchars($item['title'] ?? 'Untitled'); ?></strong><br>
                            <small>Type: <?php echo htmlspecialchars($item['type'] ?? 'small'); ?> | Date: <?php echo htmlspecialchars($item['date'] ?? ''); ?></small>
                        </div>
                        
                        <div class="item-actions">
                            <a href="edit_project_item.php?index=<?php echo $index; ?>" class="btn btn-edit">Edit</a>
                            <a href="?delete=<?php echo $index; ?>" class="btn btn-delete" onclick="return confirm('Are you sure?')">Delete</a>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>
    </div>
</body>
</html>
