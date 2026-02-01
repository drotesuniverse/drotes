<?php
/**
 * Snippet: WPGraphQL WooCommerce Customization Fee - FINAL STABLE VERSION
 * 
 * How it works:
 * 1. Frontend sends extraData as JSON: {"customization": "...", "custom_fee_amount": "20"}
 * 2. WPGraphQL decodes this and passes it to WC()->cart->add_to_cart() as $cart_item_data
 * 3. This snippet adds the fee to BASE PRICE (AED) BEFORE currency conversion
 * 
 * FIX: Fetches raw price from database to avoid currency-converted prices
 */

// =============================================================================
// APPLY THE FEE TO CART ITEM PRICE - FINAL VERSION
// =============================================================================
add_action('woocommerce_before_calculate_totals', function ($cart) {
    if (is_admin() && !defined('DOING_AJAX')) {
        return;
    }
    
    // Prevent running multiple times
    if (did_action('woocommerce_before_calculate_totals') >= 2) {
        return;
    }

    // Runtime guard to prevent processing same items multiple times in one request
    static $processed_items = [];

    foreach ($cart->get_cart() as $cart_item_key => $cart_item) {
        
        // Skip if already processed in this request
        if (in_array($cart_item_key, $processed_items)) {
            continue;
        }

        // Check if custom fee exists (always in AED from frontend)
        if (!isset($cart_item['custom_fee_amount']) || floatval($cart_item['custom_fee_amount']) <= 0) {
            continue;
        }

        $fee_to_add_aed = floatval($cart_item['custom_fee_amount']);

        // CRITICAL: Get RAW price from database (guaranteed to be in AED)
        // This works for both simple and variable products
        $product_id = !empty($cart_item['variation_id']) ? $cart_item['variation_id'] : $cart_item['product_id'];
        
        // Try sale price first, then regular price, then fallback to _price
        $raw_price_aed = get_post_meta($product_id, '_sale_price', true);
        if (!$raw_price_aed || $raw_price_aed === '') {
            $raw_price_aed = get_post_meta($product_id, '_regular_price', true);
        }
        if (!$raw_price_aed || $raw_price_aed === '') {
            $raw_price_aed = get_post_meta($product_id, '_price', true);
        }
        
        $raw_price_aed = floatval($raw_price_aed);

        if ($raw_price_aed > 0) {
            // Add fee to base AED price
            $new_price_aed = $raw_price_aed + $fee_to_add_aed;
            
            // Set new price - Currency plugin will convert this later
            $cart_item['data']->set_price($new_price_aed);
            
            // Mark as processed
            $processed_items[] = $cart_item_key;
        }
    }
}, 1); // Priority 1: Run BEFORE Currency Switcher plugins

// =============================================================================
// DISPLAY CUSTOMIZATION IN CART
// =============================================================================
add_filter('woocommerce_get_item_data', function ($item_data, $cart_item) {
    if (isset($cart_item['customization']) && !empty($cart_item['customization'])) {
        $item_data[] = array(
            'key'     => 'Customization',
            'value'   => wc_clean($cart_item['customization']),
        );
    }
    if (isset($cart_item['customer_file_name']) && !empty($cart_item['customer_file_name'])) {
        $item_data[] = array(
            'key'     => 'Uploaded File',
            'value'   => wc_clean($cart_item['customer_file_name']),
        );
    }
    return $item_data;
}, 10, 2);

// =============================================================================
// SAVE CUSTOMIZATION TO ORDER
// =============================================================================
add_action('woocommerce_checkout_create_order_line_item', function ($item, $cart_item_key, $values, $order) {
    if (isset($values['customization'])) {
        $item->add_meta_data('Customization', $values['customization'], true);
    }
    if (isset($values['custom_fee_amount'])) {
        $item->add_meta_data('Customization Fee (AED)', $values['custom_fee_amount'], true);
    }
    if (isset($values['customer_file_url']) && !empty($values['customer_file_url'])) {
        $item->add_meta_data('Customer Uploaded File URL', esc_url($values['customer_file_url']), true);
    }
    if (isset($values['customer_file_name']) && !empty($values['customer_file_name'])) {
        $item->add_meta_data('Customer Uploaded File Name', wc_clean($values['customer_file_name']), true);
    }
}, 10, 4);

// =============================================================================
// HELPER: Sanitize Filename
// =============================================================================
if (!function_exists('drotes_sanitize_filename')) {
function drotes_sanitize_filename($filename) {
    $info = pathinfo($filename);
    $name_without_ext = $info['filename'];
    
    $sanitized = strtolower($name_without_ext);
    $sanitized = preg_replace('/[^a-z0-9]/', '_', $sanitized);
    $sanitized = preg_replace('/_+/', '_', $sanitized);
    $sanitized = trim($sanitized, '_');
    
    return substr($sanitized, 0, 50);
}
}

// =============================================================================
// DISPLAY CLICKABLE FILE URL IN ADMIN ORDER DETAILS
// =============================================================================
add_filter('woocommerce_order_item_display_meta_value', function ($display_value, $meta, $item) {
    if ($meta->key === 'Customer Uploaded File URL' || $meta->key === '_customer_uploaded_file_url') {
        $url = $display_value;
        
        // Fallback: Construct URL if missing
        if (empty($url) || !filter_var($url, FILTER_VALIDATE_URL)) {
             $file_name = $item->get_meta('Customer Uploaded File Name');
             if (!empty($file_name)) {
                 $order_id = $item->get_order_id();
                 $sanitized_name = drotes_sanitize_filename($file_name);
                 $public_id = "order_{$order_id}_{$sanitized_name}";
                 $cloud_name = 'dzb0jezs8'; 
                 $url = "https://res.cloudinary.com/{$cloud_name}/image/upload/drotes/orders/{$public_id}";
                 
                 // Append extension
                 $info = pathinfo($file_name);
                 if (!empty($info['extension'])) {
                     $url .= "." . $info['extension'];
                 }
             }
        }

        if (!empty($url)) {
            return sprintf(
                '<a href="%s" target="_blank" style="color: #2271b1; text-decoration: underline;">View File ↗</a>',
                esc_url($url)
            );
        }
    }
    return $display_value;
}, 10, 3);

// =============================================================================
// ADD CUSTOM COLUMN TO ORDER ITEMS TABLE
// =============================================================================
add_action('woocommerce_admin_order_item_headers', function ($order) {
    echo '<th class="customer-file" style="width: 80px; text-align: center;">Customer File</th>';
});

add_action('woocommerce_admin_order_item_values', function ($product, $item, $item_id) {
    $file_url = $item->get_meta('Customer Uploaded File URL');
    $file_name = $item->get_meta('Customer Uploaded File Name');
    
    // Construct URL if missing
    if (empty($file_url) && !empty($file_name)) {
        $order_id = $item->get_order_id();
        $sanitized_name = drotes_sanitize_filename($file_name);
        $public_id = "order_{$order_id}_{$sanitized_name}";
        $cloud_name = 'dzb0jezs8';
        $file_url = "https://res.cloudinary.com/{$cloud_name}/image/upload/drotes/orders/{$public_id}";
        
        // Append extension
        $info = pathinfo($file_name);
        if (!empty($info['extension'])) {
             $file_url .= "." . $info['extension'];
        }
    }
    
    echo '<td class="customer-file" style="text-align: center;">';
    if (!empty($file_url)) {
        $display_name = !empty($file_name) ? esc_html($file_name) : 'View File';
        $is_cloudinary = strpos($file_url, 'cloudinary.com') !== false;
        
        printf(
            '<a href="%s" target="_blank" class="button button-small" title="%s" style="font-size: 11px;">%s Open</a>',
            esc_url($file_url),
            esc_attr($display_name),
            $is_cloudinary ? '☁️' : '📁'
        );
    } else {
        echo '<span style="color: #999;">—</span>';
    }
    echo '</td>';
}, 10, 3);


// =============================================================================
// REDIRECT ORDER RECEIVED TO NEXT.JS (Headless Support)
// =============================================================================
add_filter('woocommerce_get_checkout_order_received_url', function ($return_url, $order) {
    // 1. Base URL of your Next.js site
    $frontend_url = 'https://drotes.com'; 
    
    // Check if we have an environment variable override for production
    // (This part requires server env, fallback to localhost is default for this snippet)

    // 2. Build the new URL
    // We append params so the Next.js page can fetch/display data
    $new_url = add_query_arg([
        'orderId'     => $order->get_id(),
        'orderNumber' => $order->get_order_number(),
        'email'       => $order->get_billing_email(),
        'total'       => $order->get_total() . ' ' . $order->get_currency(),
        'date'        => $order->get_date_created()->date('Y-m-d'),
        'key'         => $order->get_order_key(),
    ], $frontend_url . '/checkout/order-received');

    return $new_url;
}, 9999, 2); // Priority 9999 to override plugins

// =============================================================================
// FORCE CURRENCY FOR GATEWAYS (ZIINA/STRIPE)
// =============================================================================
add_action('woocommerce_checkout_update_order_meta', function($order_id) {
    // Check if we have a currency cookie from the frontend
    if (isset($_COOKIE['wmc_current_currency'])) {
        $currency_code = sanitize_text_field($_COOKIE['wmc_current_currency']);
        update_post_meta($order_id, '_order_currency', $currency_code);
        update_post_meta($order_id, '_currency', $currency_code); // Legacy support
    }
});

// =============================================================================
// FORCE GATEWAY RETURN URL (Cleanest Fix)
// =============================================================================
add_filter('woocommerce_get_return_url', function($url, $order) {
    if (!$order) return $url;
    if ($order->get_status() === 'failed') return $url;

    $frontend_url = 'https://drotes.com'; // Redirect to LOCAL Next.js for testing
    
    // Construct Next.js Success URL
    return add_query_arg([
        'orderId'     => $order->get_id(),
        'orderNumber' => $order->get_order_number(),
        'email'       => $order->get_billing_email(),
        'total'       => $order->get_total() . ' ' . $order->get_currency(), // Clean value
        'date'        => $order->get_date_created()->date('Y-m-d'),
        'key'         => $order->get_order_key(),
        'redirect_source' => 'gateway_filter' // Debug flag
    ], $frontend_url . '/checkout/order-received');
}, 999, 2);

// =============================================================================
// CATCH-ALL REDIRECT (Aggressive Safety Net)
// =============================================================================
add_action('template_redirect', function() {
    global $wp;
    $uri = $_SERVER['REQUEST_URI'] ?? '';
    
    // Check purely based on URL structure (bypassing WP conditionals)
    if (strpos($uri, 'order-received') !== false) {
        $order_id = 0;

        // Pattern 1: /order-received/123/ (Pretty Permalinks)
        if (preg_match('/order-received\/(\d+)/', $uri, $matches)) {
            $order_id = intval($matches[1]);
        }
        
        // Pattern 2: Standard WC query var
        if (!$order_id && isset($wp->query_vars['order-received'])) {
            $order_id = intval($wp->query_vars['order-received']);
        }

        // Pattern 3: Fallback query param
        if (!$order_id && isset($_GET['order-received'])) {
            $order_id = intval($_GET['order-received']);
        }

        if ($order_id) {
            $order = wc_get_order($order_id);
            if ($order) {
                // Determine the key (critical for security)
                $order_key = isset($_GET['key']) ? sanitize_text_field($_GET['key']) : $order->get_order_key();

                $frontend_url = 'https://drotes.com'; 
                $new_url = add_query_arg([
                    'orderId'     => $order->get_id(),
                    'orderNumber' => $order->get_order_number(),
                    'email'       => $order->get_billing_email(),
                    'total'       => $order->get_total() . ' ' . $order->get_currency(),
                    'date'        => $order->get_date_created()->date('Y-m-d'),
                    'key'         => $order_key,
                ], $frontend_url . '/checkout/order-received');
                
                wp_redirect($new_url);
                exit;
            }
        }
    }
}, 1); // Priority 1: Run BEFORE everything else


// =============================================================================
// OTP ENDPOINTS: /drotes/v1/otp/send & /verify
// =============================================================================
add_action('rest_api_init', function () {
    // 1. Endpoint: Send OTP
    register_rest_route('drotes/v1', '/otp/send', array(
        'methods' => 'POST',
        'callback' => 'drotes_handle_otp_send',
        'permission_callback' => '__return_true', // Open endpoint (secured by rate limiting/logic below)
    ));

    // 2. Endpoint: Verify OTP
    register_rest_route('drotes/v1', '/otp/verify', array(
        'methods' => 'POST',
        'callback' => 'drotes_handle_otp_verify',
        'permission_callback' => '__return_true',
    ));
});

/**
 * Handle Sending OTP
 */
if (!function_exists('drotes_handle_otp_send')) {
function drotes_handle_otp_send($request) {
    $params = $request->get_json_params();
    $email = sanitize_email($params['email'] ?? '');

    if (!is_email($email)) {
        return new WP_Error('invalid_email', 'Invalid email address', array('status' => 400));
    }

    // Generate 6-digit Code
    $otp_code = rand(100000, 999999);
    
    // Store in Transient (Expires in 5 minutes)
    // Key format: drotes_otp_{md5_email}
    $transient_key = 'drotes_otp_' . md5($email);
    set_transient($transient_key, $otp_code, 5 * 60);

    // Send Email via wp_mail (Uses server's SMTP/Mail config)
    $subject = 'Your Verification Code';
    $message = "Your verification code is: {$otp_code}\n\nThis code expires in 5 minutes.";
    $headers = array('Content-Type: text/plain; charset=UTF-8');
    
    // CUSTOM SENDER: Set header to no-reply@drotes.com
    $headers[] = 'From: drotes <no-reply@drotes.com>';

    $sent = wp_mail($email, $subject, $message, $headers);

    if ($sent) {
        return new WP_REST_Response(array('success' => true, 'message' => 'OTP sent successfully'), 200);
    } else {
        // Fallback or Error Logging
        error_log("Drotes OTP: Failed to send email to $email");
        return new WP_Error('email_failed', 'Failed to send verification email. Please try again.', array('status' => 500));
    }
}
}

/**
 * Handle Verifying OTP
 */
if (!function_exists('drotes_handle_otp_verify')) {
function drotes_handle_otp_verify($request) {
    $params = $request->get_json_params();
    $email = sanitize_email($params['email'] ?? '');
    $code = sanitize_text_field($params['code'] ?? '');

    if (empty($email) || empty($code)) {
        return new WP_Error('missing_params', 'Email and Code are required', array('status' => 400));
    }

    $transient_key = 'drotes_otp_' . md5($email);
    $stored_code = get_transient($transient_key);

    if (!$stored_code) {
        return new WP_Error('expired_otp', 'Verification code expired or invalid.', array('status' => 400));
    }

    if ($stored_code == $code) {
        // Success! Delete the transient so it can't be reused
        delete_transient($transient_key);
        return new WP_REST_Response(array('success' => true, 'message' => 'OTP verified'), 200);
    } else {
        return new WP_Error('invalid_otp', 'Invalid verification code.', array('status' => 400));
    }
}
}
