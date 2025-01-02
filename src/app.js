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
            const systemBubble = document.getElementById('system-bubble');
            
            systemBubble.classList.remove('hidden');
            systemBubble.textContent = response.data.context;

            // 타입별 배경색 설정
            const colors = {
                0: '#ffcdd2',
                1: '#fff9c4',
                2: '#e3f2fd',
                3: '#f3e5f5'
            };
            systemBubble.style.backgroundColor = colors[response.data.type];
            systemBubble.style.display = 'block';

            // type 조건 처리
            if (response.data.type === 0) {
                systemBubble.textContent = '고민을 입력해주세요.';
            } else if (response.data.type === 2) {
                // textarea 요소 제거
                const textArea = messageForm.querySelector('textarea');
                const submitButton = messageForm.querySelector('button[type="submit"]');
                if (textArea) textArea.remove();
                if (submitButton) submitButton.remove();

                // 버튼 컨테이너 생성 및 추가
                const buttonContainer = document.createElement('div');
                buttonContainer.className = 'button-container';
                buttonContainer.innerHTML = `
                    <button type="button" class="btn btn-info" id="btn-yes" href="https://gominmalgo.vercel.app/">처음으로</button>
                    <button type="button" class="btn btn-Success" id="btn-no">지도보기</button>
                `;
                messageForm.appendChild(buttonContainer);
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
    });

    // axios 요청 전
    document.getElementById('user-input').disabled = true;
    document.querySelector('button[type="submit"]').disabled = true;

    // axios 요청 완료 후
    document.getElementById('user-input').disabled = false;
    document.querySelector('button[type="submit"]').disabled = false;
});

    document.getElementById('btn-yes').addEventListener('click', () => {
        window.location.href = 'https://gominmalgo.vercel.app/';
    });
    
    document.getElementById('btn-no').addEventListener('click', () => {
        window.location.href = '/map';
    });
