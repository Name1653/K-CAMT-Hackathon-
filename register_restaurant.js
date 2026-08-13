document.addEventListener("DOMContentLoaded", () => {
    const restaurantForm = document.getElementById("restaurantForm");

    if (restaurantForm) {
        restaurantForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const name = document.getElementById("restaurantName").value.trim();
            const location = document.getElementById("restaurantLocation").value.trim();
            const openTime = document.getElementById("openTime").value;
            const closeTime = document.getElementById("closeTime").value;

            if (!name || !location || !openTime || !closeTime) {
                alert("모든 항목을 입력해 주세요.");
                return;
            }

            try {
                const response = await fetch("http://localhost:8080/api/restaurants", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include",
                    body: JSON.stringify({ name, location, openTime, closeTime })
                });

                if (response.ok) {
                    const restaurant = await response.json();

                    // Index.html의 "음식 등록하기" 화면이 가게 정보를 재조회 API 없이
                    // memberId별 localStorage 캐시로 읽어오므로, 여기서도 같은 형식으로 저장해
                    // 다시 가게 정보를 입력하라고 뜨지 않게 한다.
                    try {
                        const meResponse = await fetch("http://localhost:8080/api/auth/me", {
                            method: "GET",
                            credentials: "include"
                        });

                        if (meResponse.ok) {
                            const me = await meResponse.json();
                            localStorage.setItem(
                                "greenloop_restaurant_" + me.memberId,
                                JSON.stringify(restaurant)
                            );
                        }
                    } catch (cacheError) {
                        console.error("가게 정보 캐싱 실패:", cacheError);
                    }

                    alert("파트너 가입이 완료되었습니다.");
                    window.location.replace("/index.html");
                } else {
                    const errorText = await response.text();
                    console.error("파트너 가입 실패:", errorText);
                    alert("가입 처리 중 문제가 발생했습니다.");
                }
            } catch (error) {
                console.error("통신 에러:", error);
                alert("서버와 통신할 수 없습니다.");
            }
        });
    }
});
