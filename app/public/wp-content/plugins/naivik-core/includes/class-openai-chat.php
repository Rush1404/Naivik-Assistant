class Naivik_OpenAI {
    private $api_key = 'Ysk-proj-7020lPF2uOQuaHgC5LNVVm_GFtPK-uoIl7M81rC5yg79XWsjEQjxUkl7sYWbEzh_kcqd__sUFZT3BlbkFJE0Av-4IZYNNhEslZNz8T6Ly_uaR6SeG_vIx_TK0rX4XR2h5wHfw7w5aKG4kXjFxxS7-ATy9UoA';

    public function get_chat_response($user_input) {
        $response = wp_remote_post('https://api.openai.com/v1/chat/completions', [
            'headers' => [
                'Authorization' => 'Bearer ' . $this->api_key,
                'Content-Type'  => 'application/json',
            ],
            'body' => json_encode([
                'model' => 'gpt-4o', // Or gpt-4o-mini for speed
                'messages' => [
                    ['role' => 'system', 'content' => 'You are Naivik, a helpful, professional PM assistant.'],
                    ['role' => 'user', 'content' => $user_input]
                ]
            ])
        ]);
        
        $body = json_decode(wp_remote_retrieve_body($response), true);
        return $body['choices'][0]['message']['content'];
    }
}