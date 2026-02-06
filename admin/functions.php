<?php
// Helper functions

function getJsonData($filename) {
    $path = __DIR__ . '/../data/' . $filename;
    if (file_exists($path)) {
        $content = file_get_contents($path);
        return json_decode($content, true) ?: [];
    }
    return [];
}

function saveJsonData($filename, $data) {
    $path = __DIR__ . '/../data/' . $filename;
    // Pretty print for readability
    return file_put_contents($path, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

function handleUpload($file, $targetDir = '../images/uploads/') {
    if (!isset($file['name']) || $file['error'] !== UPLOAD_ERR_OK) {
        return null;
    }
    
    // Absolute path
    $absTargetDir = __DIR__ . '/' . $targetDir;
    
    // Create directory if not exists
    if (!file_exists($absTargetDir)) {
        mkdir($absTargetDir, 0777, true);
    }

    $filename = basename($file['name']);
    // Sanitize filename
    $filename = preg_replace('/[^a-zA-Z0-9._-]/', '', $filename);
    
    // Prevent overwriting by prepending unique ID if needed, 
    // but for CMS it's often better to just use the name or prepend timestamp
    $finalName = time() . '_' . $filename;
    $targetPath = $absTargetDir . $finalName;
    
    if (move_uploaded_file($file['tmp_name'], $targetPath)) {
        // Return path relative to the website root (removing ../)
        return 'images/uploads/' . $finalName;
    }
    return null;
}
?>
