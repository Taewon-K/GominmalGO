let map, currentPositionMarker;
let markers = []; // 병원 마커들을 저장할 배열

// 카카오맵이 로드될 때까지 대기하는 함수
async function waitForKakaoMap() {
    console.log('카카오맵 상태 확인 중...', typeof kakao);
    try {
        if (typeof kakao === 'undefined' || !kakao.maps) {
            console.log('카카오맵 로딩 대기...');
            await window.kakaoMapLoaded;
        }
        console.log('카카오맵 사용 준비 완료', kakao.maps);
    } catch (error) {
        console.error('카카오맵 로드 중 에러:', error);
        throw error;
    }
}

// 기존 마커들을 제거하는 함수
function clearMarkers() {
    markers.forEach(marker => marker.setMap(null));
    markers = [];
}

// 정보창을 생성하고 마커에 연결하는 함수
function createInfoWindow(hospital) {
    const content = `
        <div class="p-4 min-w-[250px]">
            <h3 class="font-bold mb-3">${hospital.place_name}</h3>
            <div class="space-y-2">
                <p class="mb-2">${hospital.address_name}</p>
                <p class="text-gray-600">${hospital.phone || '전화번호 없음'}</p>
                ${hospital.place_url ? 
                    `<a href="${hospital.place_url}" target="_blank" 
                        class="inline-block mt-3 text-blue-500 hover:text-blue-700 underline">
                        상세정보 보기
                    </a>` : 
                    ''
                }
            </div>
        </div>
    `;

    // 가게 이름과 주소의 길이를 비교하여 더 긴 것을 기준으로 너비 계산
    const maxLength = Math.max(
        hospital.place_name.length,
        hospital.address_name.length
    );
    
    // 글자 하나당 약 15px로 계산하고, 여백을 위해 50px 추가
    const width = Math.max(250, maxLength * 15 + 50);

    return new kakao.maps.InfoWindow({
        content: content,
        removable: true,
        width: width,  // 동적으로 계산된 너비 적용
        height: 150    // 높이는 고정값으로 설정
    });
}

// 병원 검색 결과를 처리하는 함수
function handleHospitalResults(data, status, pagination) {
    if (status === kakao.maps.services.Status.OK) {
        clearMarkers(); // 기존 마커 제거

        // 검색된 장소 위치를 기준으로 지도 범위를 재설정하기 위해 bounds 객체 생성
        const bounds = new kakao.maps.LatLngBounds();

        data.forEach(hospital => {
            const position = new kakao.maps.LatLng(hospital.y, hospital.x);
            
            const marker = new kakao.maps.Marker({
                position: position,
                map: map
            });

            const infowindow = createInfoWindow(hospital);

            kakao.maps.event.addListener(marker, 'click', function() {
                infowindow.open(map, marker);
            });

            markers.push(marker);
            bounds.extend(position);
        });

        // 검색된 장소들의 위치를 기준으로 지도 범위 재설정
        map.setBounds(bounds);
    } else {
        alert('검색 결과를 찾을 수 없습니다.');
    }
}

// 지역 검색 함수
export async function searchByRegion(regionName) {
    await waitForKakaoMap();
    
    const ps = new kakao.maps.services.Places();
    ps.keywordSearch(`${regionName} 정신병원`, handleHospitalResults);
}

// 기존 searchHospitals 함수 수정
export async function searchHospitals(latitude, longitude) {
    await waitForKakaoMap();
    
    const ps = new kakao.maps.services.Places();
    const options = {
        location: new kakao.maps.LatLng(latitude, longitude),
        radius: 5000, // 반경 5km로 확대
        sort: kakao.maps.services.SortBy.DISTANCE
    };

    ps.keywordSearch('정신병원', handleHospitalResults, options);
}

export async function initMap(latitude, longitude) {
    try {
        await waitForKakaoMap();
        
        const mapContainer = document.getElementById('map');
        
        if (!mapContainer) {
            throw new Error('지도 컨테이너를 찾을 수 없습니다.');
        }

        mapContainer.style.width = '100%';
        mapContainer.style.height = '500px';
        mapContainer.style.border = '2px solid #e6ffe6';
        mapContainer.style.borderRadius = '30px';

        const mapOption = {
            center: new kakao.maps.LatLng(latitude, longitude),
            level: 3    
        };

        map = new kakao.maps.Map(mapContainer, mapOption);

        // 반응형 처리를 위한 리사이즈 이벤트 리스너 추가
        window.addEventListener('resize', () => {
            map.relayout();
            
            // 마커가 있는 경우 해당 영역으로 지도 범위 재설정
            if (markers.length > 0) {
                const bounds = new kakao.maps.LatLngBounds();
                markers.forEach(marker => {
                    bounds.extend(marker.getPosition());
                });
                map.setBounds(bounds);
            } else {
                // 마커가 없는 경우에만 초기 중심점으로 이동
                map.setCenter(new kakao.maps.LatLng(latitude, longitude));
            }
        });

        // 초기 지도 레이아웃 설정
        window.setTimeout(() => {
            map.relayout();
            map.setCenter(new kakao.maps.LatLng(latitude, longitude));
        }, 300);

        currentPositionMarker = new kakao.maps.Marker({
            position: new kakao.maps.LatLng(latitude, longitude),
            map: map
        });

    } catch (error) {
        console.error('지도 초기화 중 오류 발생:', error);
        throw error;
    }
}

export function getCurrentLocation() {
    console.log('위치 정보 요청 시작');
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async function(position) {
                console.log('위치 정보 수신:', position.coords);
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                await initMap(latitude, longitude);
            },
            function(error) {
                console.error('위치 정보 오류:', error);
                // 서울시청 좌표로 기본 설정
                initMap(37.5666805, 126.9784147);
            }
        );
    } else {
        console.log('Geolocation 지원하지 않음');
        initMap(37.5666805, 126.9784147);
    }
}

// initializeApp 함수 수정
export function initializeApp() {
    try {
        // 현재 위치 기반 초기 검색
        getCurrentLocation();
        
        // 검색 버튼 이벤트 리스너
        const searchButton = document.getElementById('search-button');
        const searchInput = document.getElementById('location-search');
        
        searchButton.addEventListener('click', () => {
            const region = searchInput.value.trim();
            if (region) {
                searchByRegion(region);
            } else {
                alert('검색할 지역을 입력해주세요.');
            }
        });

        // 엔터 키 이벤트 처리
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const region = searchInput.value.trim();
                if (region) {
                    searchByRegion(region);
                } else {
                    alert('검색할 지역을 입력해주세요.');
                }
            }
        });

        // 현재 위치 주변 검색 버튼
        const findHospitalsBtn = document.getElementById('find-hospitals');
        findHospitalsBtn.addEventListener('click', () => {
            // 현재 지도의 중심 좌표 가져오기
            const center = map.getCenter();
            
            // 장소 검색 객체 생성
            const ps = new kakao.maps.services.Places();

            // 키워드로 정신병원 검색
            ps.keywordSearch('정신건강의학과 정신병원', (data, status) => {
                if (status === kakao.maps.services.Status.OK) {
                    // 기존 마커들 제거
                    clearMarkers();

                    // 검색된 장소 위치를 기준으로 지도 범위를 재설정하기 위해 bounds 객체 생성
                    const bounds = new kakao.maps.LatLngBounds();

                    data.forEach(hospital => {
                        const position = new kakao.maps.LatLng(hospital.y, hospital.x);
                        
                        const marker = new kakao.maps.Marker({
                            position: position,
                            map: map
                        });

                        const infowindow = createInfoWindow(hospital);

                        kakao.maps.event.addListener(marker, 'click', function() {
                            infowindow.open(map, marker);
                        });

                        markers.push(marker);
                        bounds.extend(position);
                    });

                    // 검색된 장소들의 위치를 기준으로 지도 범위 재설정
                    map.setBounds(bounds);
                } else {
                    alert('주변 정신건강의학과를 찾을 수 없습니다.');
                }
            }, {
                location: center,
                radius: 5000, // 5km 반경으로 확대
                sort: kakao.maps.services.SortBy.DISTANCE
            });
        });
    } catch (error) {
        console.error('초기화 중 오류 발생:', error);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await window.kakaoMapLoaded;  // 카카오맵 로드 완료 대기
        initializeApp();
    } catch (error) {
        console.error('지도 초기화 중 오류 발생:', error);
    }
});
 