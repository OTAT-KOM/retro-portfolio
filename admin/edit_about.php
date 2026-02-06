<?php
require_once 'auth.php';
require_once 'functions.php';
checkLogin();

$message = '';
$data = getJsonData('about.json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Save main fields
    $data['summary_title'] = $_POST['summary_title'] ?? '';
    $data['summary_text'] = $_POST['summary_text'] ?? '';
    $data['contact_email'] = $_POST['contact_email'] ?? '';
    
    if (isset($_FILES['summary_image']) && $_FILES['summary_image']['error'] === UPLOAD_ERR_OK) {
        $path = handleUpload($_FILES['summary_image']);
        if ($path) $data['summary_image'] = $path;
    }

    // Save Social Media List
    $social = [];
    if (isset($_POST['social_index'])) {
        foreach ($_POST['social_index'] as $i) {
             // Handle icon upload if any
             $icon = $_POST['social_icon_existing'][$i] ?? '';
             
             // Check if file uploaded
             if (isset($_FILES['social_icon_file']) && isset($_FILES['social_icon_file']['name'][$i]) && $_FILES['social_icon_file']['error'][$i] === UPLOAD_ERR_OK) {
                 $fileArray = [
                     'name' => $_FILES['social_icon_file']['name'][$i],
                     'type' => $_FILES['social_icon_file']['type'][$i],
                     'tmp_name' => $_FILES['social_icon_file']['tmp_name'][$i],
                     'error' => $_FILES['social_icon_file']['error'][$i],
                     'size' => $_FILES['social_icon_file']['size'][$i]
                 ];
                 // Try to upload to icons folder if possible, else uploads
                 $upPath = handleUpload($fileArray, '../images/icons/'); 
                 if ($upPath) $icon = $upPath;
             }

             $social[] = [
                 'name' => $_POST['social_name'][$i] ?? '',
                 'url' => $_POST['social_url'][$i] ?? '',
                 'icon' => $icon
             ];
        }
    }
    $data['social_media'] = $social;

    if (saveJsonData('about.json', $data)) {
        $message = 'Saved successfully!';
    } else {
        $message = 'Error saving data.';
    }
}

$socialList = $data['social_media'] ?? [];
?>
<!DOCTYPE html>
<html>
<head>
    <title>Edit About - OTAT Admin</title>
    <style>
        body { font-family: sans-serif; padding: 20px; background: #f4f6f9; margin: 0; }
        .container { max-width: 900px; margin: 40px auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .form-group { margin-bottom: 20px; }
        label { display: block; margin-bottom: 8px; font-weight: bold; color: #333; }
        input[type="text"], textarea { width: 100%; padding: 10px; box-sizing: border-box; border: 1px solid #ddd; border-radius: 4px; font-size: 16px; }
        textarea { height: 150px; resize: vertical; }
        button { padding: 12px 24px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; }
        button:hover { background: #0056b3; }
        .current-image { margin-top: 10px; max-width: 200px; border-radius: 4px; }
        .social-item { display: flex; gap: 10px; background: #f9f9f9; padding: 10px; margin-bottom: 10px; border: 1px solid #eee; align-items: flex-start; }
        .social-inputs { flex: 1; display: grid; grid-template-columns: 1fr 2fr 1fr; gap: 10px; }
        .btn-remove { background: #dc3545; padding: 5px 10px; font-size: 12px; margin-top: 5px; }
        .icon-preview { width: 40px; height: 40px; object-fit: contain; background: #ddd; }
        .alert { padding: 15px; background: #d4edda; color: #155724; border-radius: 4px; margin-bottom: 20px; }
        .back-link { display: inline-block; margin-bottom: 20px; text-decoration: none; color: #666; font-size: 14px; }
    </style>
    <script>
        function addSocialItem() {
            const container = document.getElementById('social-container');
            const index = new Date().getTime();
            const html = `
                <div class="social-item" id="social-item-${index}">
                    <input type="hidden" name="social_index[]" value="${index}">
                    <div class="icon-preview"></div>
                    <div class="social-inputs">
                        <div>
                            <label style="font-size:12px;">Name</label>
                            <input type="text" name="social_name[${index}]" placeholder="e.g. Instagram">
                        </div>
                        <div>
                            <label style="font-size:12px;">URL</label>
                            <input type="text" name="social_url[${index}]" placeholder="https://...">
                        </div>
                        <div>
                            <label style="font-size:12px;">Icon</label>
                            <input type="file" name="social_icon_file[${index}]">
                            <input type="hidden" name="social_icon_existing[${index}]" value="">
                        </div>
                    </div>
                    <button type="button" class="btn-remove" onclick="document.getElementById('social-item-${index}').remove()">X</button>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', html);
        }
    </script>
</head>
<body>
    <div class="container">
        <a href="index.php" class="back-link">&larr; Back to Dashboard</a>
        <h2>Edit About / Contact</h2>
        
        <?php if ($message): ?>
            <div class="alert"><?php echo $message; ?></div>
        <?php endif; ?>
        
        <form method="post" enctype="multipart/form-data">
            <div class="form-group">
                <label>Summary Title</label>
                <input type="text" name="summary_title" value="<?php echo htmlspecialchars($data['summary_title'] ?? ''); ?>">
            </div>
            
            <div class="form-group">
                <label>Summary Text</label>
                <textarea name="summary_text"><?php echo htmlspecialchars($data['summary_text'] ?? ''); ?></textarea>
            </div>
            
            <div class="form-group">
                <label>Summary Image</label>
                <?php if (!empty($data['summary_image'])): ?>
                    <img src="../<?php echo $data['summary_image']; ?>" class="current-image"><br>
                <?php endif; ?>
                <input type="file" name="summary_image">
            </div>

            <div class="form-group">
                <label>Contact Email</label>
                <input type="text" name="contact_email" value="<?php echo htmlspecialchars($data['contact_email'] ?? ''); ?>">
            </div>

            <h3>Social Media Links</h3>
            <div id="social-container">
                <?php foreach ($socialList as $idx => $item): 
                    $uniqueIdx = $idx;
                ?>
                    <div class="social-item" id="social-item-<?php echo $uniqueIdx; ?>">
                        <input type="hidden" name="social_index[]" value="<?php echo $uniqueIdx; ?>">
                        <?php if (!empty($item['icon'])): ?>
                            <img src="../<?php echo $item['icon']; ?>" class="icon-preview">
                        <?php else: ?>
                            <div class="icon-preview"></div>
                        <?php endif; ?>
                        
                        <div class="social-inputs">
                            <div>
                                <label style="font-size:12px;">Name</label>
                                <input type="text" name="social_name[<?php echo $uniqueIdx; ?>]" value="<?php echo htmlspecialchars($item['name'] ?? ''); ?>">
                            </div>
                            <div>
                                <label style="font-size:12px;">URL</label>
                                <input type="text" name="social_url[<?php echo $uniqueIdx; ?>]" value="<?php echo htmlspecialchars($item['url'] ?? ''); ?>">
                            </div>
                            <div>
                                <label style="font-size:12px;">Icon (Upload new)</label>
                                <input type="file" name="social_icon_file[<?php echo $uniqueIdx; ?>]">
                                <input type="hidden" name="social_icon_existing[<?php echo $uniqueIdx; ?>]" value="<?php echo htmlspecialchars($item['icon'] ?? ''); ?>">
                            </div>
                        </div>
                        <button type="button" class="btn-remove" onclick="document.getElementById('social-item-<?php echo $uniqueIdx; ?>').remove()">X</button>
                    </div>
                <?php endforeach; ?>
            </div>
            <button type="button" onclick="addSocialItem()" style="background: #6c757d; margin-bottom: 20px;">+ Add Link</button>
            
            <br>
            <button type="submit">Save Changes</button>
        </form>
    </div>
</body>
</html>
