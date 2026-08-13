document.addEventListener("DOMContentLoaded", () => {
    const memberCard = document.getElementById("memberCard");

    if (memberCard) {
        memberCard.addEventListener("click", async () => {
            // 사용자 경험을 위해 로딩 상태 표시 가능
            try {
                const response = await fetch("http://localhost:8080/api/members/role", {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include", // 쿠키(세션/JWT)를 포함하여 요청
                    body: JSON.stringify({ role: "MEMBER" })
                });

                if (response.ok) {
                    // 성공 시 일반 회원 메인 페이지로 이동
                    window.location.replace("/");
                } else {
                    const errorText = await response.text();
                    console.error("역할 업데이트 실패:", errorText);
                    alert(t("role_update_failed"));
                }
            } catch (error) {
                console.error("통신 에러:", error);
                alert(t("network_error"));
            }
        });
    }

    // 파트너 회원(가게 사장님) 클릭 이벤트
    const partnerCard = document.getElementById("partnerCard");
    if (partnerCard) {
        partnerCard.addEventListener("click", async () => {
            try {
                const response = await fetch("http://localhost:8080/api/members/role", {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include", // 쿠키(세션/JWT)를 포함하여 요청
                    body: JSON.stringify({ role: "RESTAURANT" })
                });

                if (response.ok) {
                    // 성공 시 가게 정보를 입력하는 파트너 회원가입 페이지로 이동
                    window.location.replace("/register_restaurant.html");
                } else {
                    const errorText = await response.text();
                    console.error("역할 업데이트 실패:", errorText);
                    alert(t("role_update_failed"));
                }
            } catch (error) {
                console.error("통신 에러:", error);
                alert(t("network_error"));
            }
        });
    }
});