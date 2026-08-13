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
                    window.location.replace("/index.html"); 
                } else {
                    const errorText = await response.text();
                    console.error("역할 업데이트 실패:", errorText);
                    alert("가입 처리 중 문제가 발생했습니다.");
                }
            } catch (error) {
                console.error("통신 에러:", error);
                alert("서버와 통신할 수 없습니다.");
            }
        });
    }
    
    // 파트너 회원 클릭 이벤트 (추후 구현 시 사용)
    const partnerCard = document.getElementById("partnerCard");
    if (partnerCard) {
        partnerCard.addEventListener("click", () => {
            console.log("파트너 회원 클릭됨 - API 연동 필요");
            // window.location.href = "/register/partner"; 등의 처리 추가
        });
    }
});