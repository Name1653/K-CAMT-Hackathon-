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
