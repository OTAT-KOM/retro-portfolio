<?php
require_once 'auth.php';
require_once 'functions.php';
checkLogin();

$data = getJsonData('events.json');
$items = $data['items'] ?? [];

// Handle Delete
if (isset($_GET['delete'])) {
    $index = (int)$_GET['delete'];
    if (isset($items[$index])) {
        array_splice($items, $index, 1);
        $data['items'] = $items;
        saveJsonData('events.json', $data);
        header('Location: edit_events.php');
        exit;
    }
}
?>
<!DOCTYPE html>
<html>
<head>
    <title>Manage Events - OTAT Admin</title>
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
        .date-badge { display: inline-block; background: #e9ecef; padding: 2px 6px; border-radius: 4px; font-size: 12px; margin-top: 4px; }
    </style>
</head>
<body>
    <div class="container">
        <a href="index.php" class="back-link">&larr; Back to Dashboard</a>
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <h2>Events</h2>
            <a href="edit_event_item.php" class="btn btn-add">+ Add New Event</a>
        </div>
        
        <?php if (empty($items)): ?>
            <p>No events found.</p>
        <?php else: ?>
            <div class="item-list">
                <?php foreach ($items as $index => $item): ?>
                    <div class="item-row">
                        <?php if (!empty($item['image'])): ?>
                            <img src="../<?php echo $item['image']; ?>" class="item-image">
                        <?php else: ?>
                            <div class="item-image" style="display: flex; align-items: center; justify-content: center; color: #999;">No Img</div>
                        <?php endif; ?>
                        
                        <div class="item-info">
                            <strong style="font-size: 18px;"><?php echo htmlspecialchars($item['title'] ?? 'Untitled'); ?></strong><br>
                            <?php if (!empty($item['date'])): ?>
                                <span class="date-badge"><?php echo htmlspecialchars($item['date']); ?></span>
                            <?php endif; ?>
                            <?php if (!empty($item['location'])): ?>
                                <span style="font-size: 14px; color: #666; margin-left: 10px;">@ <?php echo htmlspecialchars($item['location']); ?></span>
                            <?php endif; ?>
                        </div>
                        
                        <div class="item-actions">
                            <a href="edit_event_item.php?index=<?php echo $index; ?>" class="btn btn-edit">Edit</a>
                            <a href="?delete=<?php echo $index; ?>" class="btn btn-delete" onclick="return confirm('Are you sure you want to delete this event?')">Delete</a>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>
    </div>
</body>
</html>
