async function updateRoleToMember(redirectUrl) {
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
            window.location.replace(redirectUrl);
        } else {
            const errorText = await response.text();
            console.error("역할 업데이트 실패:", errorText);
            alert("가입 처리 중 문제가 발생했습니다.");
        }
    } catch (error) {
        console.error("통신 에러:", error);
        alert("서버와 통신할 수 없습니다.");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const memberCard = document.getElementById("memberCard");

    if (memberCard) {
        memberCard.addEventListener("click", () => {
            // 성공 시 일반 회원 메인 페이지로 이동
            updateRoleToMember("/index.html");
        });
    }

    // 파트너 회원 클릭 이벤트: 우선 MEMBER로 승격시킨 뒤 가게 정보 입력 페이지로 이동
    const partnerCard = document.getElementById("partnerCard");
    if (partnerCard) {
        partnerCard.addEventListener("click", () => {
            updateRoleToMember("/register_restaurant.html");
        });
    }
});