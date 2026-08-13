/* =========================================================
   GLOBAL
========================================================= */

let balance = 1250;

let selectedVehicle = "EV Car";
let selectedPrice = 79;
let trackingInterval = null;


/* =========================================================
   FOOD ORDER VARIABLES
========================================================= */

let foodCart = [];
let currentRestaurant = "bakery";

let deliveryType = "standard";
let deliveryFee = 25;

let orderTime = "instant";
let paymentMethod = "GreenPay";
let promoDiscount = 0;


/* =========================================================
   PAGE NAVIGATION
========================================================= */

function showPage(page,button=null){

    document.querySelectorAll(".page")
        .forEach(p=>p.classList.remove("active"));

    const target=document.getElementById("page-"+page);

    if(!target)return;

    target.classList.add("active");

    document.querySelectorAll(".navlinks button")
        .forEach(b=>b.classList.remove("active"));

    if(button){

        button.classList.add("active");

    }else{

        const navButton=document.querySelector(
            `.navlinks button[data-page="${page}"]`
        );

        if(navButton){
            navButton.classList.add("active");
        }
    }

    window.scrollTo({
        top:0,
        behavior:"smooth"
    });
}


/* =========================================================
   BALANCE
========================================================= */

function updateBalance(){

    document.getElementById("balance")
        .textContent=balance.toLocaleString();

    document.getElementById("navCredits")
        .textContent=balance.toLocaleString();

    document.getElementById("walletBalance")
        .textContent=balance.toLocaleString();
}


/* =========================================================
   EARN
========================================================= */

function earn(amount,reason){

    balance+=amount;

    updateBalance();

    const list=document.getElementById("activityList");

    const item=document.createElement("div");

    item.className="activityItem";

    item.innerHTML=`
        <span>🌱 ${reason}</span>
        <span class="plus">+${amount}</span>
    `;

    if(list){
        list.prepend(item);
    }

    toast(`+${amount} Carbon Credits earned!`);
}


/* =========================================================
   REDEEM
========================================================= */

function redeem(cost,reward){

    if(balance<cost){

        toast("Not enough Carbon Credits");

        return;
    }

    balance-=cost;

    updateBalance();

    const list=document.getElementById("activityList");

    const item=document.createElement("div");

    item.className="activityItem";

    item.innerHTML=`
        <span>🎁 ${reward}</span>
        <span style="color:#d45b5b">−${cost}</span>
    `;

    if(list){
        list.prepend(item);
    }

    toast(`${reward} redeemed successfully!`);
}


/* =========================================================
   SEARCH
========================================================= */

function search(){

    const input=document.getElementById("searchInput");

    const q=input.value.trim();

    if(!q){

        toast("Try searching for food, recycling, rides, or used items.");

        return;
    }

    const lower=q.toLowerCase();

    if(
        lower.includes("food")||
        lower.includes("pizza")||
        lower.includes("sushi")||
        lower.includes("bakery")
    ){

        showPage("food");

        toast(`Showing food results for "${q}"`);

        return;
    }

    if(
        lower.includes("recycle")||
        lower.includes("plastic")||
        lower.includes("battery")
    ){

        showPage("recycle");

        toast(`Showing recycling results for "${q}"`);

        return;
    }

    if(
        lower.includes("ev")||
        lower.includes("ride")||
        lower.includes("transport")||
        lower.includes("car")
    ){

        showPage("transport");

        toast(`Opening Green Ride for "${q}"`);

        return;
    }

    if(
        lower.includes("used")||
        lower.includes("chair")||
        lower.includes("book")||
        lower.includes("headphone")
    ){

        showPage("used");

        toast(`Showing marketplace results for "${q}"`);

        return;
    }

    toast(`Searching GreenLoop for "${q}"...`);
}


/* =========================================================
   USED MARKET SEARCH
========================================================= */

function marketSearch(){

    const q=document.getElementById("marketSearch")
        .value.trim();

    toast(
        q
        ? `Searching marketplace for "${q}"...`
        : "Enter an item to search."
    );
}


/* =========================================================
   VEHICLE SELECT
========================================================= */

function selectVehicle(button,vehicle,price,eta){

    document.querySelectorAll(".vehicle")
        .forEach(v=>v.classList.remove("active"));

    button.classList.add("active");

    selectedVehicle=vehicle;
    selectedPrice=price;

    document.getElementById("ridePrice")
        .textContent="฿"+price;

    document.getElementById("eta")
        .textContent=eta+" min";
}


/* =========================================================
   CALL EV
========================================================= */

function callEV(){

    const destination=document.getElementById("destination")
        .value.trim();

    if(!destination){

        toast("Please enter your destination.");

        return;
    }

    const status=document.getElementById("driverStatus");

    const button=document.getElementById("callRideButton");

    status.innerHTML=`
        <span class="statusDot"></span>
        Finding nearby EV driver...
    `;

    button.disabled=true;
    button.textContent="🔎 Finding driver...";

    setTimeout(()=>{

        status.innerHTML=`
            <span class="statusDot"></span>
            Driver found · Arriving in 5 min
        `;

        button.textContent="🚗 Driver is on the way";

        toast("EV driver found!");

        startEVTracking();

    },1800);
}


/* =========================================================
   EV LIVE TRACKING PROTOTYPE
========================================================= */

function startEVTracking(){

    const car=document.getElementById("evMarker");
    const eta=document.getElementById("eta");
    const status=document.getElementById("driverStatus");

    let progress=0;

    clearInterval(trackingInterval);

    trackingInterval=setInterval(()=>{

        progress+=5;

        const startX=63;
        const startY=20;

        const endX=30;
        const endY=65;

        const x=startX+((endX-startX)*progress/100);
        const y=startY+((endY-startY)*progress/100);

        car.style.left=x+"%";
        car.style.top=y+"%";

        const remaining=Math.max(
            1,
            Math.ceil(5-progress/20)
        );

        eta.textContent=remaining+" min";

        if(progress>=100){

            clearInterval(trackingInterval);

            status.innerHTML=`
                <span class="statusDot"></span>
                Driver arrived
            `;

            eta.textContent="Arrived";

            toast("🚗 Your EV has arrived!");

            const button=document.getElementById("callRideButton");

            button.textContent="🚗 Start Ride";

            button.disabled=false;

            button.onclick=()=>{

                earn(15,"Green EV ride");

                toast("Enjoy your green ride! 🌱");
            };
        }

    },1000);
}


/* =========================================================
   MAP
========================================================= */

function centerMap(){
    toast("Map centered on your location.");
}

function zoomMap(){
    toast("Zooming in...");
}

function zoomOutMap(){
    toast("Zooming out...");
}


/* =========================================================
   FOOD RESTAURANT DATA
========================================================= */

const restaurantData={

    bakery:{
        name:"Morning Bake",
        icon:"🥐",
        meta:"⭐ 4.8 · Bakery · 0.8 km",

        items:[

            {
                id:"bakery-box",
                name:"Bakery Surprise Box",
                description:"Croissants, pastries & bread",
                price:45,
                emoji:"🥐",
                credits:15,
                category:"BAKERY"
            },

            {
                id:"croissant",
                name:"Chocolate Croissant",
                description:"Fresh bakery rescue item",
                price:25,
                emoji:"🥐",
                credits:8,
                category:"BAKERY"
            },

            {
                id:"bread",
                name:"Mixed Bread Bundle",
                description:"Assorted fresh bread",
                price:35,
                emoji:"🍞",
                credits:10,
                category:"BAKERY"
            }

        ]
    },

    sushi:{
        name:"Sakana House",
        icon:"🍣",
        meta:"⭐ 4.7 · Japanese · 1.2 km",

        items:[

            {
                id:"sushi-box",
                name:"Sushi Rescue Set",
                description:"8-piece mixed sushi",
                price:87,
                emoji:"🍣",
                credits:15,
                category:"MEAT"
            },

            {
                id:"salmon",
                name:"Salmon Sushi Set",
                description:"Fresh salmon sushi",
                price:99,
                emoji:"🍣",
                credits:18,
                category:"MEAT"
            },

            {
                id:"maki",
                name:"Maki Rescue Box",
                description:"Assorted maki rolls",
                price:65,
                emoji:"🍱",
                credits:12,
                category:"MEAT"
            }

        ]
    },

    pizza:{
        name:"Green Slice",
        icon:"🍕",
        meta:"⭐ 4.9 · Pizza · 1.8 km",

        items:[

            {
                id:"pizza",
                name:"Pizza End-of-Day",
                description:"Freshly baked pizza",
                price:62,
                emoji:"🍕",
                credits:15,
                category:"PROCESSED"
            },

            {
                id:"margherita",
                name:"Margherita Pizza",
                description:"Tomato, mozzarella & basil",
                price:75,
                emoji:"🍕",
                credits:18,
                category:"PROCESSED"
            },

            {
                id:"slice",
                name:"Pizza Slice Rescue",
                description:"Single rescue slice",
                price:29,
                emoji:"🍕",
                credits:8,
                category:"PROCESSED"
            }

        ]
    },

    salad:{
        name:"Fresh Corner",
        icon:"🥗",
        meta:"⭐ 4.6 · Healthy · 2.1 km",

        items:[

            {
                id:"salad",
                name:"Healthy Salad Box",
                description:"Fresh vegetables & dressing",
                price:45,
                emoji:"🥗",
                credits:15,
                category:"VEGE"
            },

            {
                id:"wrap",
                name:"Chicken Green Wrap",
                description:"Chicken, vegetables & wrap",
                price:49,
                emoji:"🌯",
                credits:12,
                category:"MEAT"
            },

            {
                id:"fruit",
                name:"Fruit Rescue Cup",
                description:"Fresh seasonal fruits",
                price:35,
                emoji:"🍉",
                credits:10,
                category:"VEGE"
            }

        ]
    }
};


/* =========================================================
   OPEN RESTAURANT
========================================================= */

function openRestaurant(id){

    currentRestaurant=id;

    const restaurant=restaurantData[id];

    document.getElementById("modalRestaurantName")
        .textContent=restaurant.name;

    document.getElementById("modalRestaurantIcon")
        .textContent=restaurant.icon;

    document.getElementById("modalRestaurantMeta")
        .textContent=restaurant.meta;

    const menu=document.getElementById("menuList");

    menu.innerHTML="";

    restaurant.items.forEach(item=>{

        const div=document.createElement("div");

        div.className="menuItem";

        div.innerHTML=`

            <div class="menuItemImage">
                ${item.emoji}
            </div>

            <div class="menuItemInfo">

                <h4>
                    ${item.name}
                </h4>

                <p>
                    ${item.description}
                </p>

                <span class="menuPrice">
                    ฿${item.price}
                    · 🌱 +${item.credits}
                </span>

            </div>

            <button class="addMenu"
                    onclick="addToCart('${item.id}')">
                +
            </button>
        `;

        menu.appendChild(div);
    });

    document.getElementById("restaurantModal")
        .classList.add("show");
}


function closeRestaurant(){

    document.getElementById("restaurantModal")
        .classList.remove("show");
}


/* =========================================================
   VIEW ALL FOOD ITEMS / CATEGORY FILTER
========================================================= */

const foodCategoryLabels={
    MEAT:"Meat",
    VEGE:"Vege",
    BAKERY:"Bakery",
    PROCESSED:"Processed",
    DRINKS:"Drinks",
    DEFAULT:"All"
};

function selectFoodCategory(button,category){

    document.querySelectorAll(".foodCategory")
        .forEach(btn=>btn.classList.remove("active"));

    button.classList.add("active");

    showAllFoodItems(category);
}


let liveFoods=[];

async function showAllFoodItems(category){

    document.getElementById("restaurantSectionHead").style.display="none";
    document.getElementById("restaurantGrid").style.display="none";

    document.getElementById("allFoodItemsSectionHead").style.display="flex";
    document.getElementById("foodCategoryToolbar").style.display="flex";

    const label=foodCategoryLabels[category]||null;

    document.getElementById("allFoodItemsTitle").textContent=
        label&&category!=="DEFAULT" ? `${label} deals` : "All food deals";

    document.getElementById("allFoodItemsSubtitle").textContent=
        label&&category!=="DEFAULT"
            ? `Rescue items in the ${label} category`
            : "Today's rescue food deals, freshly posted by restaurants";

    const grid=document.getElementById("allFoodItemsGrid");

    grid.style.display="grid";
    grid.innerHTML=`
        <p style="grid-column:1/-1;color:var(--muted);text-align:center;padding:30px 0;">
            Loading today's deals...
        </p>
    `;

    try{

        const res=await fetch("http://localhost:8080/api/foods",{
            method:"GET",
            credentials:"include",
        });

        if(!res.ok){
            throw new Error("음식 목록 조회 실패: "+res.status);
        }

        liveFoods=await res.json();

    }catch(error){

        console.error("음식 목록 조회 실패:",error);

        grid.innerHTML=`
            <p style="grid-column:1/-1;color:var(--muted);text-align:center;padding:30px 0;">
                음식 목록을 불러오지 못했습니다. 백엔드(localhost:8080)가 실행 중인지 확인해 주세요.
            </p>
        `;

        return;
    }

    const items=category&&category!=="DEFAULT"
        ? liveFoods.filter(food=>food.category===category)
        : liveFoods;

    grid.innerHTML="";

    items.forEach(food=>{

        const card=document.createElement("article");

        card.className="foodItemCard";
        card.style.cursor="pointer";
        card.onclick=()=>openFoodDetail(food.id);

        card.innerHTML=`

            <div class="foodItemImage" style="position:relative;">

                <img src="http://localhost:8080${food.imageUrl}" alt="${food.title}">

                <span class="restaurantDiscount">
                    ${food.discountRate}% OFF
                </span>

            </div>

            <div class="foodItemBody">

                <h4>
                    ${food.title}
                </h4>

                <p class="foodItemRestaurant">
                    🏪 Restaurant #${food.restaurantId} · ⏰ Closes ${food.closingTime}
                </p>

                <p class="foodItemDescription">
                    ${food.description}
                </p>

                <div class="foodItemFooter">

                    <span class="menuPrice">
                        <s style="color:var(--muted); font-weight:600;">฿${food.originalPrice}</s>
                        ฿${food.discountedPrice}
                    </span>

                    <button class="addMenu"
                            onclick="event.stopPropagation(); addLiveFoodToCart(${food.id})">
                        +
                    </button>

                </div>

            </div>
        `;

        grid.appendChild(card);
    });

    if(items.length===0){

        grid.innerHTML=`
            <p style="grid-column:1/-1;color:var(--muted);text-align:center;padding:30px 0;">
                오늘 등록된 ${label&&category!=="DEFAULT"?label+" ":""}딜이 아직 없어요 — 곧 만나요!
            </p>
        `;
    }
}


function addLiveFoodToCart(foodId){

    const food=liveFoods.find(f=>f.id===foodId);

    if(!food)return;

    const cartId="live-"+food.id;

    const existing=foodCart.find(x=>x.id===cartId);

    if(existing){

        existing.qty++;

    }else{

        foodCart.push({
            id:cartId,
            name:food.title,
            price:food.discountedPrice,
            restaurant:"Restaurant #"+food.restaurantId,
            qty:1
        });
    }

    updateCartUI();

    toast(`${food.title} added to cart`);
}


async function openFoodDetail(foodId){

    try{

        const res=await fetch(`http://localhost:8080/api/foods/${foodId}`,{
            method:"GET",
            credentials:"include",
        });

        if(!res.ok){
            throw new Error("음식 상세 조회 실패: "+res.status);
        }

        const food=await res.json();

        document.getElementById("foodDetailImage").src="http://localhost:8080"+food.imageUrl;
        document.getElementById("foodDetailTitle").textContent=food.title;
        document.getElementById("foodDetailDescription").textContent=food.description;
        document.getElementById("foodDetailMeta").textContent=
            `🏪 Restaurant #${food.restaurantId} · ⏰ Closes ${food.closingTime}`;
        document.getElementById("foodDetailOriginalPrice").textContent="฿"+food.originalPrice;
        document.getElementById("foodDetailPrice").textContent=
            `฿${food.discountedPrice} (${food.discountRate}% OFF)`;

        const addButton=document.getElementById("foodDetailAddButton");

        if(food.sold){
            addButton.textContent="Sold out";
            addButton.disabled=true;
            addButton.onclick=null;
        }else{
            addButton.textContent="Add to cart";
            addButton.disabled=false;
            addButton.onclick=()=>{
                addLiveFoodToCart(food.id);
                closeFoodDetail();
            };
        }

        document.getElementById("foodDetailModal").classList.add("show");

    }catch(error){
        console.error("음식 상세 조회 실패:",error);
        toast("음식 정보를 불러오지 못했습니다.");
    }
}


function closeFoodDetail(){
    document.getElementById("foodDetailModal").classList.remove("show");
}


function hideAllFoodItems(){

    document.getElementById("allFoodItemsSectionHead").style.display="none";
    document.getElementById("allFoodItemsGrid").style.display="none";
    document.getElementById("foodCategoryToolbar").style.display="none";

    document.getElementById("restaurantSectionHead").style.display="flex";
    document.getElementById("restaurantGrid").style.display="grid";

    document.querySelectorAll(".foodCategory")
        .forEach(btn=>btn.classList.remove("active"));
}


/* =========================================================
   CART
========================================================= */

function addToCart(itemId){

    const restaurant=restaurantData[currentRestaurant];

    const item=restaurant.items.find(
        x=>x.id===itemId
    );

    if(!item)return;

    const existing=foodCart.find(
        x=>x.id===itemId
    );

    if(existing){

        existing.qty++;

    }else{

        foodCart.push({
            ...item,
            restaurant:restaurant.name,
            qty:1
        });

    }

    updateCartUI();

    toast(`${item.name} added to cart`);
}


function changeCartQty(itemId,amount){

    const item=foodCart.find(
        x=>x.id===itemId
    );

    if(!item)return;

    item.qty+=amount;

    if(item.qty<=0){

        foodCart=foodCart.filter(
            x=>x.id!==itemId
        );
    }

    updateCartUI();
}


function getFoodSubtotal(){

    return foodCart.reduce(
        (sum,item)=>
            sum+(item.price*item.qty),
        0
    );
}


function updateCartUI(){

    const count=foodCart.reduce(
        (sum,item)=>sum+item.qty,
        0
    );

    document.getElementById("cartCount")
        .textContent=count;

    document.getElementById("modalCartTotal")
        .textContent="฿"+getFoodSubtotal();

    const list=document.getElementById("cartItems");

    if(!foodCart.length){

        list.innerHTML=`

            <div class="emptyCart">

                🛒

                <h3>
                    Your cart is empty
                </h3>

                <p>
                    Add some rescued food first.
                </p>

            </div>
        `;

        updateCheckoutTotals();

        return;
    }

    list.innerHTML="";

    foodCart.forEach(item=>{

        const div=document.createElement("div");

        div.className="cartItem";

        div.innerHTML=`

            <div class="cartItemEmoji">
                ${item.emoji}
            </div>

            <div class="cartItemInfo">

                <b>
                    ${item.name}
                </b>

                <small>
                    ฿${item.price}
                    · 🌱 +${item.credits}
                </small>

            </div>

            <div class="qtyControls">

                <button onclick="changeCartQty('${item.id}',-1)">
                    −
                </button>

                <b>
                    ${item.qty}
                </b>

                <button onclick="changeCartQty('${item.id}',1)">
                    +
                </button>

            </div>

            <strong>
                ฿${item.price*item.qty}
            </strong>
        `;

        list.appendChild(div);
    });

    updateCheckoutTotals();
}


function openCart(){

    closeRestaurant();

    updateCartUI();

    document.getElementById("cartModal")
        .classList.add("show");
}


function closeCart(){

    document.getElementById("cartModal")
        .classList.remove("show");
}


/* =========================================================
   DELIVERY OPTIONS
========================================================= */

function selectDelivery(button,type,fee){

    document.querySelectorAll(".deliveryOption")
        .forEach(x=>x.classList.remove("active"));

    button.classList.add("active");

    deliveryType=type;
    deliveryFee=fee;

    updateCheckoutTotals();
}


/* =========================================================
   DELIVERY TIME
========================================================= */

function selectTime(button,type){

    document.querySelectorAll(".timeOption")
        .forEach(x=>x.classList.remove("active"));

    button.classList.add("active");

    orderTime=type;

    const area=document.getElementById("scheduleArea");

    if(type==="schedule"){

        area.classList.add("show");

    }else{

        area.classList.remove("show");
    }

    updateCheckoutTotals();
}


/* =========================================================
   PAYMENT
========================================================= */

function selectPayment(button,method){

    document.querySelectorAll(".paymentOption")
        .forEach(x=>x.classList.remove("active"));

    button.classList.add("active");

    paymentMethod=method;
}


/* =========================================================
   PROMO
========================================================= */

function applyPromo(){

    const code=document.getElementById("promoInput")
        .value
        .trim()
        .toUpperCase();

    if(code==="GREEN70"){

        promoDiscount=Math.round(
            getFoodSubtotal()*.10
        );

        document.getElementById("promoMessage")
            .textContent=
            "✓ GreenLoop promo applied: 10% extra off";

    }else if(code==="RESCUE100"){

        promoDiscount=30;

        document.getElementById("promoMessage")
            .textContent=
            "✓ ฿30 rescue food discount applied";

    }else{

        promoDiscount=0;

        document.getElementById("promoMessage")
            .textContent=
            "Invalid promo code";
    }

    updateCheckoutTotals();
}


/* =========================================================
   GROUP ORDER
========================================================= */

function startGroupOrder(){

    toast(
        "Group Order created! Share link with friends."
    );
}


/* =========================================================
   CHECKOUT TOTAL
========================================================= */

function updateCheckoutTotals(){

    const subtotal=getFoodSubtotal();

    let fee=deliveryFee;

    if(orderTime==="pickup"){
        fee=0;
    }

    const total=Math.max(
        0,
        subtotal+fee-promoDiscount
    );

    document.getElementById("checkoutSubtotal")
        .textContent="฿"+subtotal;

    document.getElementById("checkoutDelivery")
        .textContent="฿"+fee;

    document.getElementById("checkoutDiscount")
        .textContent="-฿"+promoDiscount;

    document.getElementById("checkoutTotal")
        .textContent="฿"+total;

    document.getElementById("placeOrderTotal")
        .textContent="฿"+total;
}


/* =========================================================
   PLACE FOOD ORDER
========================================================= */

function placeFoodOrder(){

    if(!foodCart.length){

        toast("Your cart is empty.");

        return;
    }

    const total=Math.max(
        0,
        getFoodSubtotal()+
        (orderTime==="pickup"?0:deliveryFee)-
        promoDiscount
    );

    closeCart();

    document.getElementById("orderModal")
        .classList.add("show");

    toast(
        `Order placed successfully · ฿${total}`
    );

    startFoodTracking();

    const credits=foodCart.reduce(
        (sum,item)=>
            sum+(item.credits*item.qty),
        0
    );

    setTimeout(()=>{

        earn(
            credits,
            "Food rescue order"
        );

    },1200);

    foodCart=[];
    updateCartUI();
}


/* =========================================================
   FOOD ORDER TRACKING
========================================================= */

function startFoodTracking(){

    const steps=[
        "tracking1",
        "tracking2",
        "tracking3",
        "tracking4"
    ];

    steps.forEach(id=>{
        document.getElementById(id)
            .classList.remove("active");
    });

    document.getElementById("tracking1")
        .classList.add("active");

    const bike=document.getElementById("deliveryBike");

    bike.style.left="45%";
    bike.style.top="50%";

    setTimeout(()=>{

        document.getElementById("tracking2")
            .classList.add("active");

        toast(
            "🍳 Restaurant is preparing your order"
        );

    },2500);

    setTimeout(()=>{

        document.getElementById("tracking3")
            .classList.add("active");

        bike.style.left="65%";
        bike.style.top="55%";

        toast(
            "🛵 Driver picked up your order"
        );

    },5500);

    setTimeout(()=>{

        document.getElementById("tracking4")
            .classList.add("active");

        bike.style.left="80%";
        bike.style.top="70%";

        toast(
            "📍 Your order is arriving"
        );

    },8500);
}


function closeOrderTracking(){

    document.getElementById("orderModal")
        .classList.remove("show");
}


/* =========================================================
   TOAST
========================================================= */

function toast(message){

    const el=document.getElementById("toast");

    el.textContent=message;

    el.classList.add("show");

    clearTimeout(window.greenLoopToast);

    window.greenLoopToast=setTimeout(()=>{

        el.classList.remove("show");

    },2600);
}


/* =========================================================
   LANGUAGE
========================================================= */

const translations={

    en:{
        home:"Home",
        food:"Food Deals",
        recycle:"Recycle",
        transport:"Green Ride",
        used:"Used Items",
        wallet:"Carbon Wallet",
        login: "Login / Sign Up"
    },

    th:{
        home:"หน้าหลัก",
        food:"อาหารลดพิเศษ",
        recycle:"รีไซเคิล",
        transport:"เรียกรถ EV",
        used:"ของมือสอง",
        wallet:"กระเป๋าคาร์บอน",
        login: "เข้าสู่ระบบ / สมัครสมาชิก"
    },

    ko:{
        home:"홈",
        food:"마감 할인 음식",
        recycle:"재활용",
        transport:"친환경 차량",
        used:"중고 물품",
        wallet:"탄소 지갑",
        login: "로그인 / 회원가입"
    }

};


function setLanguage(lang){
    document.querySelectorAll("[data-i18n]").forEach(el => { 
        let k = el.dataset.i18n; 
        if (translations[lang][k]) { 
            el.textContent = translations[lang][k]; 
        } 
    });

    const t=translations[lang];

    const pages=[
        "home",
        "food",
        "recycle",
        "transport",
        "used",
        "wallet"
    ];

    document.querySelectorAll(".navlinks button")
        .forEach((button,index)=>{

            if(t[pages[index]]){
                button.textContent=t[pages[index]];
            }
        });

    toast(
        lang==="th"
        ? "เปลี่ยนภาษาเป็นไทยแล้ว"
        : lang==="ko"
        ? "한국어로 변경되었습니다"
        : "Language changed to English"
    );
}

/* =========================================================
   GOOGLE LOGIN MODAL & AUTH CONTROLS
========================================================= */

// 1. 상단바의 로그인 텍스트를 클릭했을 때 실행되는 함수
function triggerGoogleLogin(event) {
    if (event) event.preventDefault();
    document.getElementById("loginModal").classList.add("show");
}

// 2. 모달 닫기 함수 (X 버튼 또는 로그인 성공 시 호출)
function closeLoginModal() {
    document.getElementById("loginModal").classList.remove("show");
}

// 3. 구글 로그인 시스템 초기화 및 버튼 렌더링
// 💡 만약 window.onload가 이미 코드에 존재한다면, 내부 내용만 병합해 주세요!
let googleLoginInitialized = false;

function initializeGoogleLogin() {
    if (googleLoginInitialized || !window.google?.accounts?.id) return;

    const buttonContainer = document.getElementById("googleButtonContainer");
    if (!buttonContainer) return;

    googleLoginInitialized = true;
    google.accounts.id.initialize({
        client_id: "913313676574-m0goem1u6dri2jnserrrskvne0g17bku.apps.googleusercontent.com",
        callback: handleCredentialResponse
    });

    google.accounts.id.renderButton(
        buttonContainer,
        { 
            theme: "outline", 
            size: "large", 
            type: "standard",
            text: "continue_with", // 브라우저 언어에 맞춰 "구글 계정으로 계속하기" 등이 자동 적용됩니다
            shape: "rectangular",
            width: "280"
        } 
    );
}

document.addEventListener("DOMContentLoaded", async () => {
    // 1. 기존 구글 로그인 초기화 로직 실행
    initializeGoogleLogin(); 
    
    // 2. 페이지 로드 시 백엔드에 로그인 상태 확인
    await checkLoginStatus();
});

async function checkLoginStatus() {
    // register.html / register_restaurant.html은 아직 회원가입(역할 선택)이 끝나지 않은 사용자만
    // 오는 페이지이므로 백엔드에 인증 세션이 있어도 상단바는 "로그인" 상태로 유지한다.
    // 주의: 정적 서버(serve)가 "/register.html" 요청을 "/register"로 리다이렉트하는
    // clean URL 방식을 쓰기 때문에, 확장자가 없는 경로도 함께 확인해야 한다.
    // (이걸 빠뜨리면 register 페이지에서 자기 자신으로 리다이렉트를 반복하는 무한 루프가 생김)
    const isRegisterPage = /(^|\/)register(_restaurant)?(\.html)?$/.test(location.pathname);

    try {
        // 현재 로그인한 사용자의 정보를 가져오는 백엔드 API (엔드포인트 확인 필요)
        const response = await fetch("http://localhost:8080/api/auth/me", {
            method: "GET",
            credentials: "include" // 브라우저에 저장된 쿠키(인증 정보) 전송
        });

        if (response.ok && !isRegisterPage) {
            // 로그인 상태 (HTTP 200 OK)
            const userData = await response.json();

            if (!userData.role || userData.role === "NONE") {
                // 아직 회원 유형을 선택하지 않은 사용자는 계속 register.html로 보낸다
                window.location.replace("/register.html");
                return;
            }

            // 로그인 UI 업데이트 (작성해두신 showLoggedInUser 함수 재활용)
            showLoggedInUser(userData);
        } else {
            // 비로그인 상태 (HTTP 401 Unauthorized 등)
            // 구글 로그인 버튼이 보이도록 기본 상태 유지
            document.getElementById("googleLoginLink").style.display = "block";
            document.getElementById("userInfo").style.display = "none";
        }
    } catch (error) {
        console.error("로그인 상태 확인 실패:", error);
    }
}
window.addEventListener("load", initializeGoogleLogin);

// 4. 구글 로그인이 성공적으로 완료되었을 때 실행되는 콜백 함수
async function handleCredentialResponse(response) {
    // 모달 팝업 닫기
    closeLoginModal();
    
    toast("Google 계정을 확인했습니다. 서버에 로그인하는 중입니다.");

    // Spring Boot 백엔드로 JWT 토큰 전송 테스트
    try {
        const res = await fetch("http://localhost:8080/api/auth/google", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ idToken: response.credential }),
        });
        
        const responseText = await res.text();
        let data = {};
        if (responseText) {
            try {
                data = JSON.parse(responseText);
            } catch (_) {
                data = { message: responseText };
            }
        }
        
        if (res.ok) {
            console.log("백엔드 통신 성공:", data);
            toast("로그인되었습니다.");
            showLoggedInUser(data);

            // 💡 백엔드에서 보내준 회원 상태에 따라 분기 처리
            if (data.role === "NONE") {
                // if I login first, I have to register this service
                window.location.replace("/register.html");
            }
            else if (data.role === "RESTAURANT" || data.role === "MEMBER") {
                window.location.replace("/");
            }
            // backend error
            else {
                console.error("백엔드 에러:", data);
                toast(data.message || data.error || `로그인 요청 실패 (${res.status})`);
            }
        }
    } catch (error) {
        console.error("통신 실패:", error);
        toast("로그인 서버(localhost:8080)에 연결할 수 없습니다. 백엔드를 실행해 주세요.");
    }
}

// 4-1. 응답 형태가 엔드포인트마다 달라도(예: /api/auth/google 은 name을 주지만
//      /api/auth/me 는 안 주는 경우) 표시할 이름을 최대한 찾아내고, 한 번 찾은
//      이름은 세션에 캐싱해서 리다이렉트 이후에도 유지되게 한다.
const USER_DISPLAY_NAME_KEY = "gl_userDisplayName";

function resolveUserDisplayName(user) {
    if (!user) return sessionStorage.getItem(USER_DISPLAY_NAME_KEY) || "";

    const source = user.user || user.data || user;
    const candidate =
        source.name ||
        source.nickname ||
        source.username ||
        source.given_name ||
        source.email;

    if (candidate) {
        sessionStorage.setItem(USER_DISPLAY_NAME_KEY, candidate);
        return candidate;
    }

    const cached = sessionStorage.getItem(USER_DISPLAY_NAME_KEY);
    if (!cached) {
        console.warn("로그인 사용자 정보에 표시할 이름/이메일이 없습니다:", user);
    }
    return cached || "";
}

// 5. 로그인 상태를 상단바 UI에 반영
let currentUser = null;

function showLoggedInUser(user) {
    currentUser = user;

    document.getElementById("googleLoginLink").style.display = "none";

    const info = document.getElementById("userInfo");
    info.style.display = "flex";
    document.getElementById("userName").textContent = resolveUserDisplayName(user);

    applyUserRoleUI();
}

// 6. 로그아웃
async function logout() {
    try {
        await fetch("http://localhost:8080/api/auth/logout", {
            method: "POST",
            credentials: "include",
        });
    } catch (error) {
        console.error("로그아웃 요청 실패:", error);
    } finally {
        sessionStorage.removeItem(USER_DISPLAY_NAME_KEY);
        currentUser = null;

        document.getElementById("userInfo").style.display = "none";
        document.getElementById("googleLoginLink").style.display = "block";

        applyUserRoleUI();

        toast("로그아웃되었습니다.");
    }
}

// 7. 로그인/역할 상태에 따라 화면 요소 표시 여부 갱신
// (회원 유형 선택은 register.html/register.js에서 처리됨)
function applyUserRoleUI() {
    const registerButton = document.getElementById("registerRestaurantButton");
    if (!registerButton) return;

    registerButton.style.display =
        currentUser && currentUser.role === "RESTAURANT" ? "flex" : "none";
}

// 9. 음식 등록하기 (사장님 전용)

// 가게(restaurantId)는 한 번 등록하면 재로그인 전까지 재사용 —
// 조회 API가 아직 없어서 memberId별로 localStorage에 캐싱해둠
let myRestaurant=null;

function loadMyRestaurant(){
    if(!currentUser) return;

    const cached=localStorage.getItem("greenloop_restaurant_"+currentUser.memberId);

    if(cached){
        try{
            myRestaurant=JSON.parse(cached);
        }catch(_){
            myRestaurant=null;
        }
    }
}

function openFoodRegisterPage(){
    loadMyRestaurant();
    showPage("food-register");

    const hasRestaurant=!!myRestaurant;

    document.getElementById("restaurantSetupForm").style.display=hasRestaurant?"none":"block";
    document.getElementById("foodRegisterForm").style.display=hasRestaurant?"block":"none";

    if(hasRestaurant){
        document.getElementById("myRestaurantName").textContent=myRestaurant.name;
    }
}

async function submitRestaurantSetup(){

    const name=document.getElementById("restaurantName").value.trim();
    const location=document.getElementById("restaurantLocation").value.trim();
    const openTime=document.getElementById("restaurantOpenTime").value;
    const closeTime=document.getElementById("restaurantCloseTime").value;

    if(!name||!location||!openTime||!closeTime){
        toast("가게 이름, 위치, 오픈/마감 시간을 모두 입력해 주세요.");
        return;
    }

    try{
        const res=await fetch("http://localhost:8080/api/restaurants",{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            credentials:"include",
            body:JSON.stringify({
                name,
                location,
                openTime:openTime+":00",
                closeTime:closeTime+":00"
            }),
        });

        if(!res.ok){
            throw new Error("가게 등록 요청 실패: "+res.status);
        }

        const data=await res.json();

        myRestaurant=data;

        if(currentUser){
            localStorage.setItem("greenloop_restaurant_"+currentUser.memberId,JSON.stringify(data));
        }

        toast("가게가 등록되었습니다!");

        document.getElementById("restaurantSetupForm").style.display="none";
        document.getElementById("foodRegisterForm").style.display="block";
        document.getElementById("myRestaurantName").textContent=data.name;

    }catch(error){
        console.error("가게 등록 실패:",error);
        toast("가게 등록에 실패했습니다. 다시 시도해 주세요.");
    }
}

function updateDiscountedPricePreview(){

    const originalPrice=Number(document.getElementById("registerFoodOriginalPrice").value);
    const discountRate=Number(document.getElementById("registerFoodDiscountRate").value);

    const preview=document.getElementById("discountedPricePreview");

    if(!originalPrice){
        preview.textContent="";
        return;
    }

    const discountedPrice=Math.round(originalPrice*(100-(discountRate||0))/100);

    preview.textContent=`판매가: ฿${discountedPrice}`;
}

async function submitFoodRegistration(){

    if(!myRestaurant){
        toast("먼저 가게를 등록해 주세요.");
        return;
    }

    const title=document.getElementById("registerFoodTitle").value.trim();
    const description=document.getElementById("registerFoodDescription").value.trim();
    const originalPrice=Number(document.getElementById("registerFoodOriginalPrice").value);
    const discountRate=Number(document.getElementById("registerFoodDiscountRate").value)||0;
    const category=document.getElementById("registerFoodCategory").value;
    const imageFile=document.getElementById("registerFoodImage").files[0];

    if(!title||!originalPrice||!imageFile){
        toast("음식 이름, 정가, 사진을 입력해 주세요.");
        return;
    }

    const formData=new FormData();

    formData.append("restaurantId",myRestaurant.id);
    formData.append("title",title);
    formData.append("originalPrice",originalPrice);
    formData.append("discountRate",discountRate);
    formData.append("description",description);
    formData.append("category",category);
    formData.append("image",imageFile);

    try{
        const res=await fetch("http://localhost:8080/api/foods",{
            method:"POST",
            credentials:"include",
            body:formData,
        });

        if(!res.ok){
            const errText=await res.text();
            throw new Error(errText||("음식 등록 요청 실패: "+res.status));
        }

        const data=await res.json();

        document.getElementById("registerFoodTitle").value="";
        document.getElementById("registerFoodDescription").value="";
        document.getElementById("registerFoodOriginalPrice").value="";
        document.getElementById("registerFoodDiscountRate").value="";
        document.getElementById("registerFoodImage").value="";
        document.getElementById("discountedPricePreview").textContent="";

        toast(`${data.title} 이(가) 등록되었습니다!`);

        showPage("food");
        showAllFoodItems();

    }catch(error){
        console.error("음식 등록 실패:",error);
        toast("음식 등록에 실패했습니다: "+(error.message||"다시 시도해 주세요."));
    }
}


/* =========================================================
   INIT
========================================================= */

updateBalance();
