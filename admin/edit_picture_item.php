<?php
require_once 'auth.php';
require_once 'functions.php';
checkLogin();

$data = getJsonData('pictures.json');
$items = $data['items'] ?? [];
$index = isset($_GET['index']) ? (int)$_GET['index'] : null;
$item = ($index !== null && isset($items[$index])) ? $items[$index] : [];
$isNew = ($index === null);

// Ensure ID exists
if ($isNew && empty($item['id'])) {
    $item['id'] = uniqid('pic');
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Handle Main Image Upload
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $uploadedPath = handleUpload($_FILES['image']);
        if ($uploadedPath) {
            $item['image'] = $uploadedPath;
        }
    }

    $item['id'] = $_POST['id'] ?? uniqid('pic');
    $item['title'] = $_POST['title'] ?? '';
    $item['type'] = $_POST['type'] ?? 'small';
    $item['date'] = $_POST['date'] ?? '';
    $item['summary'] = $_POST['summary'] ?? '';
    $item['description'] = $_POST['description'] ?? '';

    // Handle Gallery
    $gallery = [];
    if (isset($_POST['gallery_index'])) {
        $indexes = $_POST['gallery_index']; // Array of indices from the form rows
        
        foreach ($indexes as $i) {
            // Check if deleted
            if (isset($_POST['delete_gallery'][$i]) && $_POST['delete_gallery'][$i] == '1') {
                continue;
            }

            $gType = $_POST['gallery_type'][$i] ?? 'image';
            $gCaption = $_POST['gallery_caption'][$i] ?? '';
            $gSrc = $_POST['gallery_src_existing'][$i] ?? '';

            // Handle file upload for this item
            if (isset($_FILES['gallery_file']) && isset($_FILES['gallery_file']['name'][$i]) && $_FILES['gallery_file']['error'][$i] === UPLOAD_ERR_OK) {
                $fileArray = [
                    'name' => $_FILES['gallery_file']['name'][$i],
                    'type' => $_FILES['gallery_file']['type'][$i],
                    'tmp_name' => $_FILES['gallery_file']['tmp_name'][$i],
                    'error' => $_FILES['gallery_file']['error'][$i],
                    'size' => $_FILES['gallery_file']['size'][$i]
                ];
                $upPath = handleUpload($fileArray);
                if ($upPath) {
                    $gSrc = $upPath;
                }
            }
            
            if (!empty($gSrc)) {
                $gallery[] = [
                    'type' => $gType,
                    'src' => $gSrc,
                    'caption' => $gCaption
                ];
            }
        }
    }
    
    $item['gallery'] = $gallery;

    if ($isNew) {
        array_unshift($items, $item);
    } else {
        $items[$index] = $item;
    }
    
    $data['items'] = $items;
    saveJsonData('pictures.json', $data);
    header('Location: edit_pictures.php');
    exit;
}

$galleryItems = $item['gallery'] ?? [];
?>
<!DOCTYPE html>
<html>
<head>
    <title><?php echo $isNew ? 'Add Picture' : 'Edit Picture'; ?> - OTAT Admin</title>
    <style>
        body { font-family: sans-serif; padding: 20px; background: #f4f6f9; margin: 0; }
        .container { max-width: 900px; margin: 40px auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .form-group { margin-bottom: 20px; }
        label { display: block; margin-bottom: 8px; font-weight: bold; color: #333; }
        input[type="text"], input[type="date"], textarea, select { width: 100%; padding: 10px; box-sizing: border-box; border: 1px solid #ddd; border-radius: 4px; font-size: 16px; }
        textarea { height: 100px; resize: vertical; }
        button { padding: 12px 24px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; }
        button:hover { background: #0056b3; }
        .current-image { margin-top: 10px; max-width: 200px; border-radius: 4px; }
        .gallery-item { border: 1px solid #eee; padding: 15px; margin-bottom: 10px; background: #f9f9f9; border-radius: 4px; display: flex; gap: 15px; align-items: flex-start; }
        .gallery-inputs { flex: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .gallery-preview { width: 80px; height: 80px; background: #ddd; object-fit: cover; }
        .btn-remove { background: #dc3545; padding: 5px 10px; font-size: 12px; margin-top: 5px; }
        .back-link { display: inline-block; margin-bottom: 20px; text-decoration: none; color: #666; font-size: 14px; }
    </style>
    <script>
        function addGalleryItem() {
            const container = document.getElementById('gallery-container');
            const index = new Date().getTime(); // Unique index for form handling
            const html = `
                <div class="gallery-item" id="gallery-item-${index}">
                    <input type="hidden" name="gallery_index[]" value="${index}">
                    <div class="gallery-preview" style="display:flex;align-items:center;justify-content:center;">New</div>
                    <div class="gallery-inputs">
                        <div>
                            <label>Type</label>
                            <select name="gallery_type[${index}]">
                                <option value="image">Image</option>
                                <option value="video">Video</option>
                            </select>
                        </div>
                        <div>
                            <label>File (Upload)</label>
                            <input type="file" name="gallery_file[${index}]">
                            <input type="hidden" name="gallery_src_existing[${index}]" value="">
                        </div>
                        <div style="grid-column: span 2;">
                            <label>Caption</label>
                            <input type="text" name="gallery_caption[${index}]" placeholder="Caption">
                        </div>
                    </div>
                    <div>
                        <button type="button" class="btn-remove" onclick="removeGalleryItem('${index}')">Remove</button>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', html);
        }

        function removeGalleryItem(index) {
            document.getElementById('gallery-item-' + index).remove();
        }
    </script>
</head>
<body>
    <div class="container">
        <a href="edit_pictures.php" class="back-link">&larr; Back to List</a>
        <h2><?php echo $isNew ? 'Add Picture' : 'Edit Picture'; ?></h2>
        
        <form method="post" enctype="multipart/form-data">
            <input type="hidden" name="id" value="<?php echo htmlspecialchars($item['id'] ?? uniqid('pic')); ?>">
            
            <div class="form-group">
                <label>Title</label>
                <input type="text" name="title" value="<?php echo htmlspecialchars($item['title'] ?? ''); ?>" required>
            </div>
            
            <div class="form-group">
                <label>Type (Size)</label>
                <select name="type">
                    <option value="small" <?php echo ($item['type'] ?? '') === 'small' ? 'selected' : ''; ?>>Small</option>
                    <option value="medium" <?php echo ($item['type'] ?? '') === 'medium' ? 'selected' : ''; ?>>Medium</option>
                    <option value="large" <?php echo ($item['type'] ?? '') === 'large' ? 'selected' : ''; ?>>Large</option>
                </select>
            </div>

            <div class="form-group">
                <label>Main Image</label>
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
                <label>Summary (Short text)</label>
                <textarea name="summary"><?php echo htmlspecialchars($item['summary'] ?? ''); ?></textarea>
            </div>

            <div class="form-group">
                <label>Description (Full text)</label>
                <textarea name="description" style="height: 150px;"><?php echo htmlspecialchars($item['description'] ?? ''); ?></textarea>
            </div>

            <h3>Gallery</h3>
            <div id="gallery-container">
                <?php foreach ($galleryItems as $idx => $gItem): 
                    $uniqueIdx = $idx; 
                ?>
                    <div class="gallery-item" id="gallery-item-<?php echo $uniqueIdx; ?>">
                        <input type="hidden" name="gallery_index[]" value="<?php echo $uniqueIdx; ?>">
                        
                        <?php if (!empty($gItem['src'])): ?>
                            <img src="../<?php echo $gItem['src']; ?>" class="gallery-preview">
                        <?php else: ?>
                            <div class="gallery-preview"></div>
                        <?php endif; ?>
                        
                        <div class="gallery-inputs">
                            <div>
                                <label>Type</label>
                                <select name="gallery_type[<?php echo $uniqueIdx; ?>]">
                                    <option value="image" <?php echo ($gItem['type'] ?? '') === 'image' ? 'selected' : ''; ?>>Image</option>
                                    <option value="video" <?php echo ($gItem['type'] ?? '') === 'video' ? 'selected' : ''; ?>>Video</option>
                                </select>
                            </div>
                            <div>
                                <label>File (Upload to replace)</label>
                                <input type="file" name="gallery_file[<?php echo $uniqueIdx; ?>]">
                                <input type="hidden" name="gallery_src_existing[<?php echo $uniqueIdx; ?>]" value="<?php echo htmlspecialchars($gItem['src'] ?? ''); ?>">
                            </div>
                            <div style="grid-column: span 2;">
                                <label>Caption</label>
                                <input type="text" name="gallery_caption[<?php echo $uniqueIdx; ?>]" value="<?php echo htmlspecialchars($gItem['caption'] ?? ''); ?>">
                            </div>
                        </div>
                        <div>
                            <button type="button" class="btn-remove" onclick="removeGalleryItem('<?php echo $uniqueIdx; ?>')">Remove</button>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
            <button type="button" onclick="addGalleryItem()" style="background: #6c757d; margin-bottom: 20px;">+ Add Gallery Item</button>
            
            <br>
            <button type="submit">Save Picture</button>
        </form>
    </div>
</body>
</html>
