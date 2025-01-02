import axios from 'axios';

document.addEventListener('DOMContentLoaded', function() {
    const messageForm = document.getElementById('message-form');
    const userInput = document.getElementById('user-input');

    const counsel = function (message) {
        // 사용자 입력을 버블로 표시
        const userBubble = document.getElementById('user-bubble');
        const userInput = document.getElementById('user-input');
        const systemBubble = document.getElementById('system-bubble');
        
        userBubble.textContent = message;
        userBubble.classList.remove('hidden');
        systemBubble.classList.add('hidden');
        // 텍스트 영역 축소
        userInput.style.height = '100px';
        userInput.value = '';

        axios({
            method: 'post',
            url: `https://gominmalgo.fly.dev/assistant/`,
            data: {
                'message': message
            },
            withCredentials: true
        })
        .then((response) => {
            console.log(response);
            const messageForm = document.getElementById('message-form');
            
            // 모든 타입에 대해 시스템 버블 표시
            systemBubble.textContent = response.data.content;
            systemBubble.classList.remove('hidden');

            // 타입별 배경색 설정
            const colors = {
                0: '#ffcdd2', // 빨간색
                1: '#fff9c4', // 연한 노란색
                2: '#e3f2fd', // 연한 파란색
                3: '#f3e5f5'  // 연한 보라색
            };
            systemBubble.style.backgroundColor = colors[response.data.type];

            // type이 2일 때만 버튼으로 교체
            if (response.data.type === 2) {
                messageForm.innerHTML = `
                    <div class="button-container">
                        <button type="button" class="response-btn" id="btn-yes">처음으로</button>
                        <button type="button" class="response-btn" id="btn-no">지도보기</button>
                    </div>
                `;
            }
        })
        .catch((error) => {
            console.log(error)
            alert('오류가 발생했습니다. 다시 시도해주세요.')
        })
    }

    messageForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const message = userInput.value;
        counsel(message);
        userInput.value = ''; // 입력 필드 초기화
    });

    // axios 요청 전
    document.getElementById('user-input').disabled = true;
    document.querySelector('button[type="submit"]').disabled = true;

    // axios 요청 완료 후
    document.getElementById('user-input').disabled = false;
    document.querySelector('button[type="submit"]').disabled = false;
});
