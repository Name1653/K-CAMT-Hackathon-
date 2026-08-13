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

    const target=document.getElementById("page-"+page);

    if(!target){
        // register.html / route.html 등 Index.html 밖의 개별 페이지에서는
        // 해당 섹션이 존재하지 않으므로, Index.html로 이동해 그 섹션을 보여준다.
        window.location.href="/index.html#"+page;
        return;
    }

    document.querySelectorAll(".page")
        .forEach(p=>p.classList.remove("active"));

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

// 다른 페이지에서 index.html#food 같은 링크로 들어왔을 때 해당 섹션을 바로 보여준다.
document.addEventListener("DOMContentLoaded", () => {
    const initialPage = location.hash.slice(1);

    if (initialPage && document.getElementById("page-" + initialPage)) {
        showPage(initialPage);
    }
});


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

    toast(tf("credits_earned_toast",{amount}));
}


/* =========================================================
   REDEEM
========================================================= */

function redeem(cost,reward){

    if(balance<cost){

        toast(t("not_enough_credits"));

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

    toast(tf("reward_redeemed_toast",{reward}));
}


/* =========================================================
   SEARCH
========================================================= */

function search(){

    const input=document.getElementById("searchInput");

    const q=input.value.trim();

    if(!q){

        toast(t("search_empty_toast"));

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

        toast(tf("search_food_toast",{q}));

        return;
    }

    if(
        lower.includes("recycle")||
        lower.includes("plastic")||
        lower.includes("battery")
    ){

        showPage("recycle");

        toast(tf("search_recycle_toast",{q}));

        return;
    }

    if(
        lower.includes("ev")||
        lower.includes("ride")||
        lower.includes("transport")||
        lower.includes("car")
    ){

        showPage("transport");

        toast(tf("search_transport_toast",{q}));

        return;
    }

    if(
        lower.includes("used")||
        lower.includes("chair")||
        lower.includes("book")||
        lower.includes("headphone")
    ){

        showPage("used");

        toast(tf("search_used_toast",{q}));

        return;
    }

    toast(tf("search_generic_toast",{q}));
}


/* =========================================================
   USED MARKET SEARCH
========================================================= */

function marketSearch(){

    const q=document.getElementById("marketSearch")
        .value.trim();

    toast(
        q
        ? tf("search_market_toast",{q})
        : t("search_market_empty_toast")
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

        toast(t("transport_enter_destination"));

        return;
    }

    const status=document.getElementById("driverStatus");

    const button=document.getElementById("callRideButton");

    status.innerHTML=`
        <span class="statusDot"></span>
        ${t("transport_finding_driver")}
    `;

    button.disabled=true;
    button.textContent="🔎 "+t("transport_finding_driver_short");

    setTimeout(()=>{

        status.innerHTML=`
            <span class="statusDot"></span>
            ${t("transport_driver_found")}
        `;

        button.textContent="🚗 "+t("transport_on_the_way");

        toast(t("transport_driver_found_toast"));

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
                ${t("transport_driver_arrived")}
            `;

            eta.textContent=t("transport_arrived");

            toast("🚗 "+t("transport_ev_arrived_toast"));

            const button=document.getElementById("callRideButton");

            button.textContent="🚗 "+t("transport_start_ride");

            button.disabled=false;

            button.onclick=()=>{

                earn(15,"Green EV ride");

                toast(t("transport_enjoy_ride"));
            };
        }

    },1000);
}


/* =========================================================
   MAP
========================================================= */

function centerMap(){
    toast(t("map_centered_toast"));
}

function zoomMap(){
    toast(t("map_zoom_in_toast"));
}

function zoomOutMap(){
    toast(t("map_zoom_out_toast"));
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
            restaurant:tf("restaurant_hash_label",{id:food.restaurantId}),
            qty:1
        });
    }

    updateCartUI();

    toast(tf("item_added_to_cart_toast",{name:food.title}));
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
            tf("food_detail_meta",{id:food.restaurantId,time:food.closingTime});
        document.getElementById("foodDetailOriginalPrice").textContent="฿"+food.originalPrice;
        document.getElementById("foodDetailPrice").textContent=
            tf("food_detail_price",{price:food.discountedPrice,rate:food.discountRate});

        const addButton=document.getElementById("foodDetailAddButton");

        if(food.sold){
            addButton.textContent=t("food_sold_out");
            addButton.disabled=true;
            addButton.onclick=null;
        }else{
            addButton.textContent=t("food_add_to_cart");
            addButton.disabled=false;
            addButton.onclick=()=>{
                addLiveFoodToCart(food.id);
                closeFoodDetail();
            };
        }

        document.getElementById("foodDetailModal").classList.add("show");

    }catch(error){
        console.error("음식 상세 조회 실패:",error);
        toast(t("food_detail_load_error"));
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

    toast(tf("item_added_to_cart_toast",{name:item.name}));
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
                    ${t("cart_empty_title")}
                </h3>

                <p>
                    ${t("cart_empty_desc")}
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
            .textContent=t("promo_green70_applied");

    }else if(code==="RESCUE100"){

        promoDiscount=30;

        document.getElementById("promoMessage")
            .textContent=t("promo_rescue100_applied");

    }else{

        promoDiscount=0;

        document.getElementById("promoMessage")
            .textContent=t("promo_invalid");
    }

    updateCheckoutTotals();
}


/* =========================================================
   GROUP ORDER
========================================================= */

function startGroupOrder(){

    toast(t("group_order_created_toast"));
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

        toast(t("cart_empty_toast"));

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
        tf("order_placed_toast",{total})
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
            "🍳 "+t("tracking_preparing_toast")
        );

    },2500);

    setTimeout(()=>{

        document.getElementById("tracking3")
            .classList.add("active");

        bike.style.left="65%";
        bike.style.top="55%";

        toast(
            "🛵 "+t("tracking_picked_up_toast")
        );

    },5500);

    setTimeout(()=>{

        document.getElementById("tracking4")
            .classList.add("active");

        bike.style.left="80%";
        bike.style.top="70%";

        toast(
            "📍 "+t("tracking_arriving_toast")
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

    // register.html / route.html 등 일부 페이지에는 토스트 요소가 없으므로 조용히 무시한다.
    if(!el)return;

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
        login: "Login / Sign Up",
        logout: "Logout",
        language_changed_toast: "Language changed to English",

        register_title: "Which type would you like to sign up as?",
        register_member_title: "General Member",
        register_member_desc: "Buy products and<br>earn reward points",
        register_partner_title: "Partner Member",
        register_partner_desc: "List products and<br>sell to customers",

        restaurant_form_title: "Partner Sign Up",
        restaurant_form_name_label: "Store Name",
        restaurant_form_name_placeholder: "e.g. GreenLoop Kitchen",
        restaurant_form_location_label: "Store Address",
        restaurant_form_location_placeholder: "e.g. 123 Teheran-ro, Gangnam-gu, Seoul",
        restaurant_form_open_label: "Opening Time",
        restaurant_form_close_label: "Closing Time",
        restaurant_form_submit: "Sign Up",
        restaurant_form_missing_fields: "Please fill in all fields.",
        restaurant_form_success: "Partner sign up complete.",
        role_update_failed: "Something went wrong while signing up.",
        network_error: "Could not connect to the server.",

        route_breadcrumb: "Route Recommendation",
        route_goal_pill: "Today's carbon goal · 2.0 kg CO₂",
        route_origin_label: "Origin",
        route_destination_label: "Destination",
        route_search_button: "Find stores along the way",
        route_map_start_prefix: "Start",
        route_map_end_prefix: "Arrive",
        route_map_note_title: "🛈 Recommended route via the selected restaurant",
        route_map_note_desc: "Pick up food, then continue to your destination.",
        route_store_panel_title: "🍃 Stores along your route",
        route_store_panel_sub: "Select a restaurant to see its route on the map.",
        route_store1_name: "Green Kitchen Pangyo",
        route_store1_tags: "Salad · Vegan · Reusable packaging",
        route_store1_distance: "↗ Detour +180m · closest to your route",
        route_store2_name: "Today's Salad",
        route_store2_tags: "Salad · Local food",
        route_store2_distance: "↗ Detour +420m · on your route",
        route_store3_name: "ZeroTable",
        route_store3_tags: "Zero-waste · eco-friendly restaurant",
        route_store3_distance: "↗ Detour +760m · within 1km",
        route_selected_label: "Selected",
        route_detour_label: "Extra distance",
        route_net_saved_label: "Estimated Net Saved",
        route_transport_panel_title: "🚲 Transport mode",
        route_transport_walk: "Walk",
        route_transport_bike: "Bike",
        route_transport_transit: "Transit",
        route_transport_car: "Car",
        route_metric_title: "Net Carbon Metric",
        route_metric_unit: "kg CO₂ Net Saved",
        route_metric_formula: "Food carbon saved (+) − Travel emissions (−) = Final net carbon saved",
        route_metric_pill: "✓ Emissions offset · counted toward Net-Zero",

        home_hero_title: "Turn Everyday Actions Into Rewards.",
        home_hero_desc: "Rescue food. Recycle. Ride green. Reuse. Earn Carbon Credits.",
        home_search_placeholder: "Search food, recycling stations, transport, or used items...",
        home_search_button: "Search",
        home_wallet_label: "CARBON WALLET",
        home_impact_desc: "estimated CO₂ reduction",
        home_wallet_redeem: "Redeem Carbon Credits",
        home_quick_food_sub: "Save 70–80%",
        home_quick_recycle_sub: "Earn credits",
        home_quick_transport_sub: "Book an EV",
        home_quick_used_sub: "Reuse locally",
        home_impact_title: "🌍 Your GreenLoop Impact",
        home_impact_subtitle: "Every small action creates measurable impact.",
        home_stat_credits: "Carbon Credits",
        home_stat_co2: "CO₂ reduction",
        home_stat_rank: "Green users this month",

        food_page_title: "🍱 GreenLoop Food",
        food_page_desc: "Rescue great food before it becomes waste. Save 70–80% and earn Carbon Credits.",
        food_register_button: "🍽️ Add a food item",
        food_cart_button: "🛒 Cart",
        food_banner_tag: "🔥 TODAY'S GREEN DEAL",
        food_banner_title: "Up to 80% OFF",
        food_banner_desc: "Save money and help prevent food waste.",
        food_section_title: "Restaurants near you",
        food_section_desc: "Available for sustainable food rescue delivery",
        food_view_all_button: "View all →",
        food_badge_open: "OPEN",
        food_view_menu_button: "View menu",
        food_r1_discount: "75% OFF",
        food_r1_name: "Morning Bake",
        food_r1_meta: "⭐ 4.8 · Bakery · 0.8 km",
        food_r1_desc: "End-of-day bakery boxes with fresh pastries.",
        food_r1_time: "🚴 15–25 min",
        food_r1_fee: "฿10 delivery",
        food_r2_discount: "70% OFF",
        food_r2_name: "Sakana House",
        food_r2_meta: "⭐ 4.7 · Japanese · 1.2 km",
        food_r2_desc: "Fresh sushi sets available before closing.",
        food_r2_time: "🚴 20–30 min",
        food_r2_fee: "฿15 delivery",
        food_r3_discount: "75% OFF",
        food_r3_name: "Green Slice",
        food_r3_meta: "⭐ 4.9 · Pizza · 1.8 km",
        food_r3_desc: "End-of-day pizzas at heavily reduced prices.",
        food_r3_time: "🚴 18–28 min",
        food_r3_fee: "FREE delivery",
        food_r4_discount: "70% OFF",
        food_r4_name: "Fresh Corner",
        food_r4_meta: "⭐ 4.6 · Healthy · 2.1 km",
        food_r4_desc: "Healthy salad boxes rescued before closing.",
        food_r4_time: "🚴 20–35 min",
        food_r4_fee: "฿12 delivery",
        food_all_title: "All food deals",
        food_all_subtitle: "Every rescue item from restaurants near you",
        food_back_button: "← Back",
        food_category_meat: "🥩 Meat",
        food_category_vege: "🥦 Vege",
        food_category_bakery: "🥐 Bakery",
        food_category_processed: "🥫 Processed",
        food_category_drinks: "☕ Drinks",
        food_category_all: "🍽️ All",
        food_category_other: "🍽️ Other",
        food_rewards_title: "Every rescue order earns Carbon Credits",
        food_rewards_desc: "Reduce food waste and earn +10 to +25 credits.",
        food_rescue_note: "Rescue food prices are discounted to prevent food waste.",
        food_view_cart_button: "View Cart",
        food_detail_title: "Food details",
        food_detail_meta: "🏪 Restaurant #{id} · ⏰ Closes {time}",
        food_detail_price: "฿{price} ({rate}% OFF)",
        food_detail_load_error: "Couldn't load food info.",
        food_sold_out: "Sold out",
        food_add_to_cart: "Add to cart",
        item_added_to_cart_toast: "{name} added to cart",
        restaurant_hash_label: "Restaurant #{id}",

        food_register_page_title: "🍽️ Add a Food Deal",
        food_register_page_desc: "List a rescue food item for customers to discover.",
        restaurant_setup_title: "Please register your store first",
        restaurant_setup_desc: "You only need to register your store once. You can keep adding food items under it afterward.",
        restaurant_setup_name_label: "Store name",
        restaurant_setup_name_placeholder: "e.g. Morning Bake",
        restaurant_setup_location_label: "Location",
        restaurant_setup_location_placeholder: "e.g. Gangnam-gu, Seoul ...",
        restaurant_setup_open_label: "Opening time",
        restaurant_setup_close_label: "Closing time",
        restaurant_setup_submit: "Register store",
        restaurant_setup_missing_fields: "Please enter your store name, location, and opening/closing time.",
        restaurant_setup_success_toast: "Your store has been registered!",
        restaurant_setup_failed_toast: "Failed to register your store. Please try again.",
        food_register_owned_suffix: " will be listed under this name.",
        food_register_food_name_label: "Food name",
        food_register_food_name_placeholder: "e.g. Closing-time discount lunch box",
        food_register_desc_label: "Description",
        food_register_desc_placeholder: "e.g. Today's freshly made lunch box, closing sale",
        food_register_price_label: "Price (฿)",
        food_register_discount_label: "Discount rate (%)",
        food_register_category_label: "Category",
        food_register_photo_label: "Photo",
        food_register_submit_button: "Add food item",
        food_register_price_preview: "Sale price: ฿{price}",
        food_register_missing_fields: "Please enter the food name, price, and photo.",
        food_register_need_restaurant_toast: "Please register your store first.",
        food_register_success_toast: "{title} has been registered!",
        food_register_failed_toast: "Food registration failed",
        try_again: "please try again.",

        recycle_page_title: "♻️ Recycling Stations",
        recycle_page_desc: "Recycle verified materials and earn Carbon Credits.",
        recycle_avg_credits: "Average credits per recycling action",
        recycle_challenge_title: "🌱 Green Challenge",
        recycle_challenge_desc: "Recycle 3 times this week and earn an extra 100 credits.",
        recycle_challenge_button: "Complete Challenge +100",
        recycle_s1_name: "Green Hub Nimman",
        recycle_s1_meta: "0.9 km · Open until 20:00",
        recycle_s1_tags: "Plastic · Glass · Paper",
        recycle_s2_name: "Eco Drop Station",
        recycle_s2_meta: "1.7 km · Open until 18:00",
        recycle_s2_tags: "Battery · E-waste",
        recycle_s3_name: "Zero Waste Point",
        recycle_s3_meta: "2.4 km · Open until 21:00",
        recycle_s3_tags: "Plastic · Metal",
        recycle_s4_name: "Community Green Point",
        recycle_s4_meta: "3.1 km · Open until 19:00",
        recycle_s4_tags: "All recyclables",

        transport_page_title: "🚗 Green Ride",
        transport_page_desc: "Book an EV and track your driver live.",
        transport_driver_arriving: "Driver arriving",
        transport_status_ready: "Ready to find nearby EV",
        transport_destination_question: "Where are you going?",
        transport_pickup_placeholder: "Pickup location",
        transport_destination_placeholder: "Enter destination",
        transport_choose_ev: "Choose your EV",
        transport_vehicle_car: "EV Car",
        transport_vehicle_car_meta: "4 seats · 5 min",
        transport_vehicle_taxi: "EV Taxi",
        transport_vehicle_taxi_meta: "4 seats · 3 min",
        transport_vehicle_bike: "EV Bike",
        transport_vehicle_bike_meta: "1 seat · 2 min",
        transport_estimated_fare: "Estimated fare",
        transport_co2_saved: "CO₂ saved",
        transport_call_ev_button: "🚗 Call EV",
        transport_driver_name: "Alex · EV Driver",
        transport_driver_rating: "⭐ 4.9 · Green Driver",
        transport_driver_car: "BYD Dolphin · EV-2048",
        transport_calling_driver: "Calling driver...",
        transport_opening_chat: "Opening driver chat...",
        transport_enter_destination: "Please enter your destination.",
        transport_finding_driver: "Finding nearby EV driver...",
        transport_finding_driver_short: "Finding driver...",
        transport_driver_found: "Driver found · Arriving in 5 min",
        transport_on_the_way: "Driver is on the way",
        transport_driver_found_toast: "EV driver found!",
        transport_driver_arrived: "Driver arrived",
        transport_arrived: "Arrived",
        transport_ev_arrived_toast: "Your EV has arrived!",
        transport_start_ride: "Start Ride",
        transport_enjoy_ride: "Enjoy your green ride! 🌱",
        map_centered_toast: "Map centered on your location.",
        map_zoom_in_toast: "Zooming in...",
        map_zoom_out_toast: "Zooming out...",

        used_page_title: "📦 Used Marketplace",
        used_page_desc: "Give products a second life in your community.",
        used_search_placeholder: "Search used items...",
        used_contact_button: "Contact",
        used_contact_toast: "Seller contact opened",
        used_i1_name: "Wireless Headphones",
        used_i1_meta: "Good condition · 0.7 km",
        used_i1_impact: "Reuse impact +15",
        used_i2_name: "Wooden Study Chair",
        used_i2_meta: "Like new · 1.4 km",
        used_i2_impact: "Reuse impact +20",
        used_i3_name: "University Textbook Set",
        used_i3_meta: "Used · 1.9 km",
        used_i3_impact: "Reuse impact +15",
        used_i4_name: "Travel Backpack",
        used_i4_meta: "Excellent · 2.2 km",
        used_i4_impact: "Reuse impact +15",

        wallet_page_title: "🌱 Carbon Wallet",
        wallet_page_desc: "Turn your sustainable actions into rewards.",
        wallet_available_label: "AVAILABLE CARBON CREDITS",
        wallet_green_score_label: "Green Score",
        wallet_rank_desc: "You're currently in the top 18% of green users this month.",
        wallet_redeem_title: "🎁 Redeem Rewards",
        wallet_redeem_desc: "Use Carbon Credits for sustainable rewards.",
        wallet_reward1_name: "฿50 Food Discount",
        wallet_reward2_name: "🚲 Free Green Ride",
        wallet_reward3_name: "🍱 ฿100 Food Voucher",
        wallet_redeem_button: "Redeem",
        wallet_activity_title: "🌱 Sustainability Activity",
        wallet_activity_desc: "Track your impact and rewards.",
        wallet_recent_credits_title: "Recent Carbon Credits",
        wallet_activity_recycling: "♻️ Recycling plastic",
        wallet_activity_transport: "🚗 Green transportation",
        wallet_activity_food: "🍱 Food rescue",
        wallet_activity_discount: "🎁 Food discount",
        wallet_green_score_panel_title: "🌍 Green Score",
        wallet_rank_desc_short: "You're in the top 18% of green users this month.",
        wallet_weekly_challenge_button: "Complete weekly challenge +100",

        cart_title: "🛒 Your Order",
        cart_subtitle: "Review your items before checkout.",
        cart_delivery_option_title: "Delivery option",
        cart_delivery_standard: "🚴 Standard",
        cart_delivery_standard_time: "25–35 min",
        cart_delivery_priority: "⚡ Priority",
        cart_delivery_priority_time: "15–25 min · Faster matching",
        cart_delivery_saver: "🌱 Saver",
        cart_delivery_saver_time: "35–50 min · Lowest fee",
        cart_delivery_time_title: "Delivery time",
        cart_time_now: "Now",
        cart_time_now_desc: "As soon as possible",
        cart_time_schedule: "Schedule",
        cart_time_schedule_desc: "Choose delivery time",
        cart_time_pickup: "Self Pickup",
        cart_time_pickup_desc: "Skip delivery fee",
        cart_address_title: "📍 Delivery address",
        cart_address_current: "My Current Location",
        cart_address_change: "Change",
        cart_address_toast: "Address selector opened",
        cart_payment_title: "💳 Payment",
        cart_payment_greenpay: "GreenPay Wallet",
        cart_payment_card: "Debit / Credit Card",
        cart_payment_cash: "Cash",
        cart_payment_cash_desc: "Pay driver on delivery",
        cart_promo_title: "🏷️ Promo",
        cart_promo_placeholder: "Enter promo code",
        cart_promo_apply: "Apply",
        cart_group_order_title: "👥 Group Order",
        cart_group_order_desc: "Invite friends to add their own food.",
        cart_group_order_start: "Start",
        cart_note_title: "📝 Note for restaurant",
        cart_note_placeholder: "Example: No onions, less spicy...",
        cart_summary_food: "Food",
        cart_summary_delivery: "Delivery",
        cart_summary_discount: "Discount",
        cart_summary_total: "Total",
        cart_place_order_button: "Place Order",
        cart_empty_title: "Your cart is empty",
        cart_empty_desc: "Add some rescued food first.",
        cart_empty_toast: "Your cart is empty.",
        promo_green70_applied: "✓ GreenLoop promo applied: 10% extra off",
        promo_rescue100_applied: "✓ ฿30 rescue food discount applied",
        promo_invalid: "Invalid promo code",
        group_order_created_toast: "Group Order created! Share link with friends.",
        order_placed_toast: "Order placed successfully · ฿{total}",
        not_enough_credits: "Not enough Carbon Credits",
        credits_earned_toast: "+{amount} Carbon Credits earned!",
        reward_redeemed_toast: "{reward} redeemed successfully!",

        order_confirmed_title: "Order confirmed!",
        order_confirmed_desc: "Your GreenLoop order is being prepared.",
        tracking1_title: "Order confirmed",
        tracking1_desc: "Restaurant received your order",
        tracking2_title: "Preparing",
        tracking2_desc: "Restaurant is preparing your food",
        tracking3_title: "Driver picked up",
        tracking3_desc: "Your food is on the way",
        tracking4_title: "Arriving",
        tracking4_desc: "Your order is almost there",
        tracking_driver_role: "⭐ 4.9 · Green Delivery Partner",
        tracking_calling_partner: "Calling delivery partner...",
        tracking_help_toast: "Opening order help center",
        tracking_need_help: "Need help?",
        tracking_preparing_toast: "Restaurant is preparing your order",
        tracking_picked_up_toast: "Driver picked up your order",
        tracking_arriving_toast: "Your order is arriving",

        footer_tagline: "Every sustainable action has value.",
        login_modal_desc: "Please sign in to use the service.",

        search_empty_toast: "Try searching for food, recycling, rides, or used items.",
        search_food_toast: "Showing food results for \"{q}\"",
        search_recycle_toast: "Showing recycling results for \"{q}\"",
        search_transport_toast: "Opening Green Ride for \"{q}\"",
        search_used_toast: "Showing marketplace results for \"{q}\"",
        search_generic_toast: "Searching GreenLoop for \"{q}\"...",
        search_market_toast: "Searching marketplace for \"{q}\"...",
        search_market_empty_toast: "Enter an item to search.",

        google_login_checking_toast: "Google account verified. Signing in to the server...",
        login_success_toast: "Logged in.",
        login_request_failed_toast: "Login request failed ({status})",
        login_server_unreachable_toast: "Could not connect to the login server (localhost:8080). Please start the backend.",
        logout_success_toast: "Logged out."
    },

    th:{
        home:"หน้าหลัก",
        food:"อาหารลดพิเศษ",
        recycle:"รีไซเคิล",
        transport:"เรียกรถ EV",
        used:"ของมือสอง",
        wallet:"กระเป๋าคาร์บอน",
        login: "เข้าสู่ระบบ / สมัครสมาชิก",
        logout: "ออกจากระบบ",
        language_changed_toast: "เปลี่ยนภาษาเป็นไทยแล้ว",

        register_title: "คุณต้องการสมัครสมาชิกประเภทใด?",
        register_member_title: "สมาชิกทั่วไป",
        register_member_desc: "ซื้อสินค้าและ<br>สะสมแต้ม",
        register_partner_title: "สมาชิกพาร์ทเนอร์",
        register_partner_desc: "ลงขายสินค้าและ<br>จำหน่ายได้",

        restaurant_form_title: "สมัครสมาชิกพาร์ทเนอร์",
        restaurant_form_name_label: "ชื่อร้าน",
        restaurant_form_name_placeholder: "เช่น ครัวกรีนลูป",
        restaurant_form_location_label: "ที่อยู่ร้าน",
        restaurant_form_location_placeholder: "เช่น 123 ถนนเทเฮรัน กรุงเทพฯ",
        restaurant_form_open_label: "เวลาเปิดร้าน",
        restaurant_form_close_label: "เวลาปิดร้าน",
        restaurant_form_submit: "สมัครสมาชิก",
        restaurant_form_missing_fields: "กรุณากรอกข้อมูลให้ครบทุกช่อง",
        restaurant_form_success: "สมัครสมาชิกพาร์ทเนอร์สำเร็จแล้ว",
        role_update_failed: "เกิดปัญหาระหว่างดำเนินการสมัครสมาชิก",
        network_error: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้",

        route_breadcrumb: "แนะนำเส้นทาง",
        route_goal_pill: "เป้าหมายลดคาร์บอนวันนี้ · 2.0 kg CO₂",
        route_origin_label: "จุดเริ่มต้น",
        route_destination_label: "จุดหมายปลายทาง",
        route_search_button: "ค้นหาร้านตามเส้นทาง",
        route_map_start_prefix: "เริ่มต้น",
        route_map_end_prefix: "ปลายทาง",
        route_map_note_title: "🛈 เส้นทางแนะนำผ่านร้านที่เลือก",
        route_map_note_desc: "แวะรับอาหารแล้วเดินทางต่อไปยังปลายทาง",
        route_store_panel_title: "🍃 ร้านตามเส้นทางของคุณ",
        route_store_panel_sub: "เลือกร้านอาหารเพื่อแสดงเส้นทางบนแผนที่",
        route_store1_name: "กรีนคิทเช่น พันยา",
        route_store1_tags: "สลัด · วีแกน · บรรจุภัณฑ์รียูส",
        route_store1_distance: "↗ อ้อม +180m · ใกล้เส้นทางที่สุด",
        route_store2_name: "สลัดวันนี้",
        route_store2_tags: "สลัด · อาหารท้องถิ่น",
        route_store2_distance: "↗ อ้อม +420m · อยู่บนเส้นทาง",
        route_store3_name: "ซีโร่เทเบิล",
        route_store3_tags: "ซีโร่เวสต์ · ร้านรักษ์โลก",
        route_store3_distance: "↗ อ้อม +760m · ภายใน 1km",
        route_selected_label: "ที่เลือกอยู่",
        route_detour_label: "ระยะทางเพิ่ม",
        route_net_saved_label: "คาดว่าลดสุทธิ",
        route_transport_panel_title: "🚲 วิธีเดินทาง",
        route_transport_walk: "เดิน",
        route_transport_bike: "จักรยาน",
        route_transport_transit: "ขนส่งสาธารณะ",
        route_transport_car: "รถยนต์",
        route_metric_title: "Net Carbon Metric",
        route_metric_unit: "kg CO₂ ลดสุทธิ",
        route_metric_formula: "คาร์บอนที่ลดจากอาหาร (+) − การปล่อยจากการเดินทาง (−) = คาร์บอนลดสุทธิ",
        route_metric_pill: "✓ ชดเชยการปล่อยคาร์บอนแล้ว · นับรวมใน Net-Zero",

        home_hero_title: "เปลี่ยนกิจกรรมประจำวันให้เป็นรางวัล",
        home_hero_desc: "กู้อาหาร รีไซเคิล เดินทางแบบกรีน ใช้ซ้ำ และสะสมคาร์บอนเครดิต",
        home_search_placeholder: "ค้นหาอาหาร จุดรีไซเคิล การเดินทาง หรือของมือสอง...",
        home_search_button: "ค้นหา",
        home_wallet_label: "กระเป๋าคาร์บอน",
        home_impact_desc: "คาดว่าลด CO₂",
        home_wallet_redeem: "แลกคาร์บอนเครดิต",
        home_quick_food_sub: "ลดสูงสุด 70–80%",
        home_quick_recycle_sub: "รับเครดิต",
        home_quick_transport_sub: "จองรถ EV",
        home_quick_used_sub: "ใช้ซ้ำในพื้นที่",
        home_impact_title: "🌍 อิมแพคของคุณบน GreenLoop",
        home_impact_subtitle: "ทุกการกระทำเล็กๆ สร้างผลลัพธ์ที่วัดได้",
        home_stat_credits: "คาร์บอนเครดิต",
        home_stat_co2: "CO₂ ที่ลดได้",
        home_stat_rank: "อันดับผู้ใช้กรีนเดือนนี้",

        food_page_title: "🍱 GreenLoop อาหาร",
        food_page_desc: "กู้อาหารดีๆ ก่อนกลายเป็นขยะ ลดสูงสุด 70–80% พร้อมสะสมคาร์บอนเครดิต",
        food_register_button: "🍽️ เพิ่มเมนูอาหาร",
        food_cart_button: "🛒 ตะกร้า",
        food_banner_tag: "🔥 ดีลกรีนวันนี้",
        food_banner_title: "ลดสูงสุด 80%",
        food_banner_desc: "ประหยัดเงินและช่วยลดขยะอาหาร",
        food_section_title: "ร้านอาหารใกล้คุณ",
        food_section_desc: "พร้อมให้บริการจัดส่งอาหารกู้แบบยั่งยืน",
        food_view_all_button: "ดูทั้งหมด →",
        food_badge_open: "เปิดอยู่",
        food_view_menu_button: "ดูเมนู",
        food_r1_discount: "ลด 75%",
        food_r1_name: "มอร์นิ่งเบค",
        food_r1_meta: "⭐ 4.8 · เบเกอรี่ · 0.8 km",
        food_r1_desc: "กล่องเบเกอรี่ปลายวันพร้อมเพสตรี้สดใหม่",
        food_r1_time: "🚴 15–25 นาที",
        food_r1_fee: "ค่าส่ง ฿10",
        food_r2_discount: "ลด 70%",
        food_r2_name: "ซากานะเฮาส์",
        food_r2_meta: "⭐ 4.7 · ญี่ปุ่น · 1.2 km",
        food_r2_desc: "ซูชิเซ็ตสดใหม่ก่อนปิดร้าน",
        food_r2_time: "🚴 20–30 นาที",
        food_r2_fee: "ค่าส่ง ฿15",
        food_r3_discount: "ลด 75%",
        food_r3_name: "กรีนสไลซ์",
        food_r3_meta: "⭐ 4.9 · พิซซ่า · 1.8 km",
        food_r3_desc: "พิซซ่าปลายวันราคาพิเศษ",
        food_r3_time: "🚴 18–28 นาที",
        food_r3_fee: "ส่งฟรี",
        food_r4_discount: "ลด 70%",
        food_r4_name: "เฟรชคอร์เนอร์",
        food_r4_meta: "⭐ 4.6 · เพื่อสุขภาพ · 2.1 km",
        food_r4_desc: "กล่องสลัดเพื่อสุขภาพที่กู้มาก่อนปิดร้าน",
        food_r4_time: "🚴 20–35 นาที",
        food_r4_fee: "ค่าส่ง ฿12",
        food_all_title: "ดีลอาหารทั้งหมด",
        food_all_subtitle: "ทุกรายการกู้อาหารจากร้านใกล้คุณ",
        food_back_button: "← กลับ",
        food_category_meat: "🥩 เนื้อสัตว์",
        food_category_vege: "🥦 ผัก",
        food_category_bakery: "🥐 เบเกอรี่",
        food_category_processed: "🥫 แปรรูป",
        food_category_drinks: "☕ เครื่องดื่ม",
        food_category_all: "🍽️ ทั้งหมด",
        food_category_other: "🍽️ อื่นๆ",
        food_rewards_title: "ทุกออเดอร์กู้อาหารได้คาร์บอนเครดิต",
        food_rewards_desc: "ลดขยะอาหารและรับ +10 ถึง +25 เครดิต",
        food_rescue_note: "ราคาอาหารกู้ถูกลดเพื่อป้องกันขยะอาหาร",
        food_view_cart_button: "ดูตะกร้า",
        food_detail_title: "รายละเอียดอาหาร",
        food_detail_meta: "🏪 ร้าน #{id} · ⏰ ปิด {time}",
        food_detail_price: "฿{price} (ลด {rate}%)",
        food_detail_load_error: "โหลดข้อมูลอาหารไม่สำเร็จ",
        food_sold_out: "ขายหมดแล้ว",
        food_add_to_cart: "เพิ่มลงตะกร้า",
        item_added_to_cart_toast: "เพิ่ม {name} ลงตะกร้าแล้ว",
        restaurant_hash_label: "ร้าน #{id}",

        food_register_page_title: "🍽️ เพิ่มดีลอาหาร",
        food_register_page_desc: "ลงรายการอาหารกู้ให้ลูกค้าค้นพบ",
        restaurant_setup_title: "กรุณาลงทะเบียนร้านของคุณก่อน",
        restaurant_setup_desc: "ลงทะเบียนร้านแค่ครั้งเดียว จากนั้นเพิ่มเมนูอาหารได้เรื่อยๆ",
        restaurant_setup_name_label: "ชื่อร้าน",
        restaurant_setup_name_placeholder: "เช่น มอร์นิ่งเบค",
        restaurant_setup_location_label: "ที่ตั้ง",
        restaurant_setup_location_placeholder: "เช่น เขตคังนัม กรุงโซล ...",
        restaurant_setup_open_label: "เวลาเปิด",
        restaurant_setup_close_label: "เวลาปิด",
        restaurant_setup_submit: "ลงทะเบียนร้าน",
        restaurant_setup_missing_fields: "กรุณากรอกชื่อร้าน ที่ตั้ง และเวลาเปิด/ปิดให้ครบ",
        restaurant_setup_success_toast: "ลงทะเบียนร้านสำเร็จแล้ว!",
        restaurant_setup_failed_toast: "ลงทะเบียนร้านไม่สำเร็จ กรุณาลองใหม่",
        food_register_owned_suffix: " จะถูกลงทะเบียนภายใต้ชื่อนี้",
        food_register_food_name_label: "ชื่ออาหาร",
        food_register_food_name_placeholder: "เช่น ข้าวกล่องลดราคาปิดร้าน",
        food_register_desc_label: "รายละเอียด",
        food_register_desc_placeholder: "เช่น ข้าวกล่องทำสดวันนี้ ลดราคาปิดร้าน",
        food_register_price_label: "ราคาเต็ม (฿)",
        food_register_discount_label: "อัตราส่วนลด (%)",
        food_register_category_label: "หมวดหมู่",
        food_register_photo_label: "รูปภาพ",
        food_register_submit_button: "เพิ่มเมนูอาหาร",
        food_register_price_preview: "ราคาขาย: ฿{price}",
        food_register_missing_fields: "กรุณากรอกชื่ออาหาร ราคา และรูปภาพ",
        food_register_need_restaurant_toast: "กรุณาลงทะเบียนร้านของคุณก่อน",
        food_register_success_toast: "ลงทะเบียน {title} เรียบร้อยแล้ว!",
        food_register_failed_toast: "ลงทะเบียนอาหารไม่สำเร็จ",
        try_again: "กรุณาลองใหม่อีกครั้ง",

        recycle_page_title: "♻️ จุดรีไซเคิล",
        recycle_page_desc: "รีไซเคิลวัสดุที่ผ่านการตรวจสอบและรับคาร์บอนเครดิต",
        recycle_avg_credits: "เครดิตเฉลี่ยต่อการรีไซเคิลหนึ่งครั้ง",
        recycle_challenge_title: "🌱 ชาเลนจ์กรีน",
        recycle_challenge_desc: "รีไซเคิล 3 ครั้งในสัปดาห์นี้ รับเพิ่มอีก 100 เครดิต",
        recycle_challenge_button: "ทำชาเลนจ์สำเร็จ +100",
        recycle_s1_name: "กรีนฮับ นิมมาน",
        recycle_s1_meta: "0.9 km · เปิดถึง 20:00",
        recycle_s1_tags: "พลาสติก · แก้ว · กระดาษ",
        recycle_s2_name: "เอโค่ดร็อป สเตชั่น",
        recycle_s2_meta: "1.7 km · เปิดถึง 18:00",
        recycle_s2_tags: "แบตเตอรี่ · ขยะอิเล็กทรอนิกส์",
        recycle_s3_name: "ซีโร่เวสต์ พอยต์",
        recycle_s3_meta: "2.4 km · เปิดถึง 21:00",
        recycle_s3_tags: "พลาสติก · โลหะ",
        recycle_s4_name: "คอมมูนิตี้กรีนพอยต์",
        recycle_s4_meta: "3.1 km · เปิดถึง 19:00",
        recycle_s4_tags: "รีไซเคิลได้ทุกชนิด",

        transport_page_title: "🚗 เดินทางแบบกรีน",
        transport_page_desc: "จองรถ EV และติดตามคนขับแบบเรียลไทม์",
        transport_driver_arriving: "คนขับกำลังมาถึง",
        transport_status_ready: "พร้อมค้นหารถ EV ใกล้คุณ",
        transport_destination_question: "คุณจะไปที่ไหน?",
        transport_pickup_placeholder: "จุดรับ",
        transport_destination_placeholder: "กรอกจุดหมายปลายทาง",
        transport_choose_ev: "เลือกรถ EV ของคุณ",
        transport_vehicle_car: "EV Car",
        transport_vehicle_car_meta: "4 ที่นั่ง · 5 นาที",
        transport_vehicle_taxi: "EV Taxi",
        transport_vehicle_taxi_meta: "4 ที่นั่ง · 3 นาที",
        transport_vehicle_bike: "EV Bike",
        transport_vehicle_bike_meta: "1 ที่นั่ง · 2 นาที",
        transport_estimated_fare: "ค่าโดยสารโดยประมาณ",
        transport_co2_saved: "CO₂ ที่ลดได้",
        transport_call_ev_button: "🚗 เรียกรถ EV",
        transport_driver_name: "อเล็กซ์ · คนขับ EV",
        transport_driver_rating: "⭐ 4.9 · คนขับกรีน",
        transport_driver_car: "BYD Dolphin · EV-2048",
        transport_calling_driver: "กำลังโทรหาคนขับ...",
        transport_opening_chat: "กำลังเปิดแชทกับคนขับ...",
        transport_enter_destination: "กรุณากรอกจุดหมายปลายทาง",
        transport_finding_driver: "กำลังค้นหาคนขับ EV ใกล้คุณ...",
        transport_finding_driver_short: "กำลังค้นหาคนขับ...",
        transport_driver_found: "พบคนขับแล้ว · มาถึงใน 5 นาที",
        transport_on_the_way: "คนขับกำลังเดินทางมา",
        transport_driver_found_toast: "พบคนขับ EV แล้ว!",
        transport_driver_arrived: "คนขับมาถึงแล้ว",
        transport_arrived: "มาถึงแล้ว",
        transport_ev_arrived_toast: "รถ EV ของคุณมาถึงแล้ว!",
        transport_start_ride: "เริ่มการเดินทาง",
        transport_enjoy_ride: "ขอให้เดินทางกรีนอย่างมีความสุข! 🌱",
        map_centered_toast: "จัดกึ่งกลางแผนที่ตามตำแหน่งของคุณแล้ว",
        map_zoom_in_toast: "กำลังซูมเข้า...",
        map_zoom_out_toast: "กำลังซูมออก...",

        used_page_title: "📦 ตลาดมือสอง",
        used_page_desc: "ให้ชีวิตใหม่กับสินค้าในชุมชนของคุณ",
        used_search_placeholder: "ค้นหาสินค้ามือสอง...",
        used_contact_button: "ติดต่อ",
        used_contact_toast: "เปิดหน้าติดต่อผู้ขายแล้ว",
        used_i1_name: "หูฟังไร้สาย",
        used_i1_meta: "สภาพดี · 0.7 km",
        used_i1_impact: "อิมแพคการใช้ซ้ำ +15",
        used_i2_name: "เก้าอี้ทำงานไม้",
        used_i2_meta: "เหมือนใหม่ · 1.4 km",
        used_i2_impact: "อิมแพคการใช้ซ้ำ +20",
        used_i3_name: "ชุดตำราเรียนมหาวิทยาลัย",
        used_i3_meta: "มือสอง · 1.9 km",
        used_i3_impact: "อิมแพคการใช้ซ้ำ +15",
        used_i4_name: "เป้เดินทาง",
        used_i4_meta: "สภาพดีเยี่ยม · 2.2 km",
        used_i4_impact: "อิมแพคการใช้ซ้ำ +15",

        wallet_page_title: "🌱 กระเป๋าคาร์บอน",
        wallet_page_desc: "เปลี่ยนกิจกรรมที่ยั่งยืนของคุณให้เป็นรางวัล",
        wallet_available_label: "คาร์บอนเครดิตที่ใช้ได้",
        wallet_green_score_label: "คะแนนกรีน",
        wallet_rank_desc: "ตอนนี้คุณอยู่ใน 18% แรกของผู้ใช้กรีนเดือนนี้",
        wallet_redeem_title: "🎁 แลกรางวัล",
        wallet_redeem_desc: "ใช้คาร์บอนเครดิตแลกรางวัลเพื่อความยั่งยืน",
        wallet_reward1_name: "ส่วนลดอาหาร ฿50",
        wallet_reward2_name: "🚲 นั่งกรีนไรด์ฟรี",
        wallet_reward3_name: "🍱 บัตรกำนัลอาหาร ฿100",
        wallet_redeem_button: "แลก",
        wallet_activity_title: "🌱 กิจกรรมความยั่งยืน",
        wallet_activity_desc: "ติดตามอิมแพคและรางวัลของคุณ",
        wallet_recent_credits_title: "คาร์บอนเครดิตล่าสุด",
        wallet_activity_recycling: "♻️ รีไซเคิลพลาสติก",
        wallet_activity_transport: "🚗 เดินทางแบบกรีน",
        wallet_activity_food: "🍱 กู้อาหาร",
        wallet_activity_discount: "🎁 ส่วนลดอาหาร",
        wallet_green_score_panel_title: "🌍 คะแนนกรีน",
        wallet_rank_desc_short: "คุณอยู่ใน 18% แรกของผู้ใช้กรีนเดือนนี้",
        wallet_weekly_challenge_button: "ทำชาเลนจ์รายสัปดาห์สำเร็จ +100",

        cart_title: "🛒 ออเดอร์ของคุณ",
        cart_subtitle: "ตรวจสอบรายการก่อนชำระเงิน",
        cart_delivery_option_title: "ตัวเลือกการจัดส่ง",
        cart_delivery_standard: "🚴 มาตรฐาน",
        cart_delivery_standard_time: "25–35 นาที",
        cart_delivery_priority: "⚡ ด่วน",
        cart_delivery_priority_time: "15–25 นาที · จับคู่ไวกว่า",
        cart_delivery_saver: "🌱 ประหยัด",
        cart_delivery_saver_time: "35–50 นาที · ค่าส่งต่ำสุด",
        cart_delivery_time_title: "เวลาจัดส่ง",
        cart_time_now: "ทันที",
        cart_time_now_desc: "เร็วที่สุดเท่าที่ทำได้",
        cart_time_schedule: "จองเวลา",
        cart_time_schedule_desc: "เลือกเวลาจัดส่ง",
        cart_time_pickup: "รับเองที่ร้าน",
        cart_time_pickup_desc: "ไม่มีค่าส่ง",
        cart_address_title: "📍 ที่อยู่จัดส่ง",
        cart_address_current: "ตำแหน่งปัจจุบันของฉัน",
        cart_address_change: "เปลี่ยน",
        cart_address_toast: "เปิดตัวเลือกที่อยู่แล้ว",
        cart_payment_title: "💳 การชำระเงิน",
        cart_payment_greenpay: "กระเป๋าเงิน GreenPay",
        cart_payment_card: "บัตรเดบิต/เครดิต",
        cart_payment_cash: "เงินสด",
        cart_payment_cash_desc: "จ่ายคนขับตอนรับของ",
        cart_promo_title: "🏷️ โปรโมชัน",
        cart_promo_placeholder: "กรอกโค้ดโปรโมชัน",
        cart_promo_apply: "ใช้โค้ด",
        cart_group_order_title: "👥 สั่งเป็นกลุ่ม",
        cart_group_order_desc: "ชวนเพื่อนมาเพิ่มอาหารของตัวเอง",
        cart_group_order_start: "เริ่ม",
        cart_note_title: "📝 หมายเหตุถึงร้าน",
        cart_note_placeholder: "เช่น ไม่ใส่หัวหอม เผ็ดน้อย...",
        cart_summary_food: "อาหาร",
        cart_summary_delivery: "ค่าส่ง",
        cart_summary_discount: "ส่วนลด",
        cart_summary_total: "รวมทั้งหมด",
        cart_place_order_button: "สั่งซื้อ",
        cart_empty_title: "ตะกร้าของคุณว่างเปล่า",
        cart_empty_desc: "เพิ่มอาหารกู้สักรายการก่อนนะ",
        cart_empty_toast: "ตะกร้าของคุณว่างเปล่า",
        promo_green70_applied: "✓ ใช้โปรโมชัน GreenLoop แล้ว: ลดเพิ่ม 10%",
        promo_rescue100_applied: "✓ ใช้ส่วนลดอาหารกู้ ฿30 แล้ว",
        promo_invalid: "โค้ดโปรโมชันไม่ถูกต้อง",
        group_order_created_toast: "สร้างออเดอร์กลุ่มแล้ว! แชร์ลิงก์ให้เพื่อนได้เลย",
        order_placed_toast: "สั่งซื้อสำเร็จ · ฿{total}",
        not_enough_credits: "คาร์บอนเครดิตไม่พอ",
        credits_earned_toast: "ได้รับคาร์บอนเครดิต +{amount}!",
        reward_redeemed_toast: "แลก {reward} สำเร็จแล้ว!",

        order_confirmed_title: "ยืนยันออเดอร์แล้ว!",
        order_confirmed_desc: "ออเดอร์ GreenLoop ของคุณกำลังเตรียม",
        tracking1_title: "ยืนยันออเดอร์",
        tracking1_desc: "ร้านได้รับออเดอร์ของคุณแล้ว",
        tracking2_title: "กำลังเตรียม",
        tracking2_desc: "ร้านกำลังเตรียมอาหารของคุณ",
        tracking3_title: "คนขับรับอาหารแล้ว",
        tracking3_desc: "อาหารของคุณกำลังเดินทางมา",
        tracking4_title: "ใกล้ถึงแล้ว",
        tracking4_desc: "ออเดอร์ของคุณใกล้จะถึงแล้ว",
        tracking_driver_role: "⭐ 4.9 · พาร์ทเนอร์จัดส่งกรีน",
        tracking_calling_partner: "กำลังโทรหาพาร์ทเนอร์จัดส่ง...",
        tracking_help_toast: "เปิดศูนย์ช่วยเหลือออเดอร์แล้ว",
        tracking_need_help: "ต้องการความช่วยเหลือไหม?",
        tracking_preparing_toast: "ร้านกำลังเตรียมออเดอร์ของคุณ",
        tracking_picked_up_toast: "คนขับรับออเดอร์ของคุณแล้ว",
        tracking_arriving_toast: "ออเดอร์ของคุณใกล้มาถึงแล้ว",

        footer_tagline: "ทุกการกระทำที่ยั่งยืนมีคุณค่า",
        login_modal_desc: "กรุณาเข้าสู่ระบบเพื่อใช้งานบริการ",

        search_empty_toast: "ลองค้นหาอาหาร รีไซเคิล การเดินทาง หรือของมือสอง",
        search_food_toast: "แสดงผลอาหารสำหรับ \"{q}\"",
        search_recycle_toast: "แสดงผลรีไซเคิลสำหรับ \"{q}\"",
        search_transport_toast: "เปิดกรีนไรด์สำหรับ \"{q}\"",
        search_used_toast: "แสดงผลตลาดมือสองสำหรับ \"{q}\"",
        search_generic_toast: "กำลังค้นหา \"{q}\" ใน GreenLoop...",
        search_market_toast: "กำลังค้นหา \"{q}\" ในตลาด...",
        search_market_empty_toast: "กรุณากรอกสิ่งที่ต้องการค้นหา",

        google_login_checking_toast: "ยืนยันบัญชี Google แล้ว กำลังเข้าสู่ระบบ...",
        login_success_toast: "เข้าสู่ระบบสำเร็จแล้ว",
        login_request_failed_toast: "คำขอเข้าสู่ระบบล้มเหลว ({status})",
        login_server_unreachable_toast: "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์เข้าสู่ระบบ (localhost:8080) กรุณาเปิดใช้งานเซิร์ฟเวอร์แบ็กเอนด์",
        logout_success_toast: "ออกจากระบบแล้ว"
    },

    ko:{
        home:"홈",
        food:"마감 할인 음식",
        recycle:"재활용",
        transport:"친환경 차량",
        used:"중고 물품",
        wallet:"탄소 지갑",
        login: "로그인 / 회원가입",
        logout: "로그아웃",
        language_changed_toast: "한국어로 변경되었습니다",

        register_title: "어떤 유형으로 가입하시겠어요?",
        register_member_title: "일반 회원",
        register_member_desc: "상품을 구매하고<br>포인트를 적립해요",
        register_partner_title: "파트너 회원",
        register_partner_desc: "상품을 등록하고<br>판매할 수 있어요",

        restaurant_form_title: "파트너 회원가입",
        restaurant_form_name_label: "가게명",
        restaurant_form_name_placeholder: "예) 그린루프 식당",
        restaurant_form_location_label: "가게 주소",
        restaurant_form_location_placeholder: "예) 서울시 강남구 테헤란로 123",
        restaurant_form_open_label: "영업 시작 시간",
        restaurant_form_close_label: "영업 종료 시간",
        restaurant_form_submit: "가입하기",
        restaurant_form_missing_fields: "모든 항목을 입력해 주세요.",
        restaurant_form_success: "파트너 가입이 완료되었습니다.",
        role_update_failed: "가입 처리 중 문제가 발생했습니다.",
        network_error: "서버와 통신할 수 없습니다.",

        route_breadcrumb: "경로추천",
        route_goal_pill: "오늘의 탄소 절감 목표 · 2.0 kg CO₂",
        route_origin_label: "출발지",
        route_destination_label: "목적지",
        route_search_button: "동선 맞춤 매장 찾기",
        route_map_start_prefix: "출발",
        route_map_end_prefix: "도착",
        route_map_note_title: "🛈 선택한 식당을 경유하는 추천 경로입니다",
        route_map_note_desc: "식당 픽업 후 목적지까지 이동합니다.",
        route_store_panel_title: "🍃 동선 맞춤 매장",
        route_store_panel_sub: "식당을 선택하면 왼쪽 지도에 해당 매장을 포함한 경로가 표시됩니다.",
        route_store1_name: "그린키친 판교점",
        route_store1_tags: "샐러드 · 비건 · 반소품 반품",
        route_store1_distance: "↗ 우회 거리 +180m · 경로에서 가장 가까움",
        route_store2_name: "오늘의 샐러드",
        route_store2_tags: "샐러드 · 로컬푸드",
        route_store2_distance: "↗ 우회 거리 +420m · 동선 내 매장",
        route_store3_name: "제로테이블",
        route_store3_tags: "제로웨이스트 · 친환경 식당",
        route_store3_distance: "↗ 우회 거리 +760m · 1km 이내",
        route_selected_label: "현재 선택",
        route_detour_label: "추가 이동",
        route_net_saved_label: "예상 Net Saved",
        route_transport_panel_title: "🚲 이동 수단",
        route_transport_walk: "도보",
        route_transport_bike: "자전거",
        route_transport_transit: "대중교통",
        route_transport_car: "승용차",
        route_metric_title: "Net Carbon Metric",
        route_metric_unit: "kg CO₂ Net Saved",
        route_metric_formula: "음식 절감 탄소량(+) − 이동 배출량(−) = 최종 순 탄소 절감량",
        route_metric_pill: "✓ 배출가스 상쇄 집계 완료 · Net-Zero 집계 반영",

        home_hero_title: "일상 속 작은 행동을 리워드로 바꿔보세요.",
        home_hero_desc: "음식을 구출하고, 재활용하고, 친환경 이동을 하고, 재사용하세요. 탄소 크레딧을 적립하세요.",
        home_search_placeholder: "음식, 재활용 거점, 이동수단, 중고물품을 검색하세요...",
        home_search_button: "검색",
        home_wallet_label: "탄소 지갑",
        home_impact_desc: "예상 CO₂ 절감량",
        home_wallet_redeem: "탄소 크레딧 사용하기",
        home_quick_food_sub: "최대 70~80% 할인",
        home_quick_recycle_sub: "크레딧 적립",
        home_quick_transport_sub: "전기차 예약",
        home_quick_used_sub: "우리 동네 재사용",
        home_impact_title: "🌍 나의 GreenLoop 임팩트",
        home_impact_subtitle: "작은 행동 하나하나가 눈에 보이는 변화를 만듭니다.",
        home_stat_credits: "탄소 크레딧",
        home_stat_co2: "CO₂ 절감량",
        home_stat_rank: "이번 달 친환경 유저 순위",

        food_page_title: "🍱 GreenLoop 푸드",
        food_page_desc: "버려지기 전에 좋은 음식을 구출하세요. 최대 70~80% 할인받고 탄소 크레딧도 적립하세요.",
        food_register_button: "🍽️ 음식 등록하기",
        food_cart_button: "🛒 장바구니",
        food_banner_tag: "🔥 오늘의 그린딜",
        food_banner_title: "최대 80% 할인",
        food_banner_desc: "돈도 아끼고 음식물 쓰레기도 줄여보세요.",
        food_section_title: "내 주변 식당",
        food_section_desc: "친환경 음식 구출 배달이 가능해요",
        food_view_all_button: "전체보기 →",
        food_badge_open: "영업중",
        food_view_menu_button: "메뉴 보기",
        food_r1_discount: "75% 할인",
        food_r1_name: "모닝베이크",
        food_r1_meta: "⭐ 4.8 · 베이커리 · 0.8 km",
        food_r1_desc: "신선한 페이스트리가 담긴 마감 베이커리 박스.",
        food_r1_time: "🚴 15~25분",
        food_r1_fee: "배달비 ฿10",
        food_r2_discount: "70% 할인",
        food_r2_name: "사카나 하우스",
        food_r2_meta: "⭐ 4.7 · 일식 · 1.2 km",
        food_r2_desc: "마감 전 신선한 스시 세트.",
        food_r2_time: "🚴 20~30분",
        food_r2_fee: "배달비 ฿15",
        food_r3_discount: "75% 할인",
        food_r3_name: "그린 슬라이스",
        food_r3_meta: "⭐ 4.9 · 피자 · 1.8 km",
        food_r3_desc: "마감 시간 파격 할인 피자.",
        food_r3_time: "🚴 18~28분",
        food_r3_fee: "무료 배달",
        food_r4_discount: "70% 할인",
        food_r4_name: "프레시 코너",
        food_r4_meta: "⭐ 4.6 · 건강식 · 2.1 km",
        food_r4_desc: "마감 전 구출한 건강한 샐러드 박스.",
        food_r4_time: "🚴 20~35분",
        food_r4_fee: "배달비 ฿12",
        food_all_title: "전체 음식 딜",
        food_all_subtitle: "내 주변 식당의 모든 구출 음식",
        food_back_button: "← 뒤로",
        food_category_meat: "🥩 육류",
        food_category_vege: "🥦 채소",
        food_category_bakery: "🥐 베이커리",
        food_category_processed: "🥫 가공식품",
        food_category_drinks: "☕ 음료",
        food_category_all: "🍽️ 전체",
        food_category_other: "🍽️ 기타",
        food_rewards_title: "구출 주문마다 탄소 크레딧 적립",
        food_rewards_desc: "음식물 쓰레기를 줄이고 +10~+25 크레딧을 적립하세요.",
        food_rescue_note: "구출 음식은 음식물 쓰레기를 줄이기 위해 할인된 가격이에요.",
        food_view_cart_button: "장바구니 보기",
        food_detail_title: "음식 상세정보",
        food_detail_meta: "🏪 가게 #{id} · ⏰ 마감 {time}",
        food_detail_price: "฿{price} ({rate}% 할인)",
        food_detail_load_error: "음식 정보를 불러오지 못했습니다.",
        food_sold_out: "품절",
        food_add_to_cart: "장바구니에 담기",
        item_added_to_cart_toast: "{name}을(를) 장바구니에 담았어요",
        restaurant_hash_label: "가게 #{id}",

        food_register_page_title: "🍽️ 음식 딜 등록하기",
        food_register_page_desc: "고객이 찾을 수 있도록 구출 음식을 등록해 보세요.",
        restaurant_setup_title: "먼저 가게 정보를 등록해 주세요",
        restaurant_setup_desc: "가게는 한 번만 등록하면 돼요. 이후 음식은 이 가게 아래로 계속 등록할 수 있어요.",
        restaurant_setup_name_label: "가게 이름",
        restaurant_setup_name_placeholder: "예) 모닝베이크",
        restaurant_setup_location_label: "위치",
        restaurant_setup_location_placeholder: "예) 서울시 강남구 ...",
        restaurant_setup_open_label: "오픈 시간",
        restaurant_setup_close_label: "마감 시간",
        restaurant_setup_submit: "가게 등록하기",
        restaurant_setup_missing_fields: "가게 이름, 위치, 오픈/마감 시간을 모두 입력해 주세요.",
        restaurant_setup_success_toast: "가게가 등록되었습니다!",
        restaurant_setup_failed_toast: "가게 등록에 실패했습니다. 다시 시도해 주세요.",
        food_register_owned_suffix: " 이름으로 등록됩니다.",
        food_register_food_name_label: "음식 이름",
        food_register_food_name_placeholder: "예) 마감 할인 도시락",
        food_register_desc_label: "설명",
        food_register_desc_placeholder: "예) 오늘 만든 도시락 마감세일합니다",
        food_register_price_label: "정가 (฿)",
        food_register_discount_label: "할인율 (%)",
        food_register_category_label: "카테고리",
        food_register_photo_label: "사진",
        food_register_submit_button: "음식 등록하기",
        food_register_price_preview: "판매가: ฿{price}",
        food_register_missing_fields: "음식 이름, 정가, 사진을 입력해 주세요.",
        food_register_need_restaurant_toast: "먼저 가게를 등록해 주세요.",
        food_register_success_toast: "{title} 이(가) 등록되었습니다!",
        food_register_failed_toast: "음식 등록에 실패했습니다",
        try_again: "다시 시도해 주세요.",

        recycle_page_title: "♻️ 재활용 거점",
        recycle_page_desc: "검증된 재활용품을 배출하고 탄소 크레딧을 적립하세요.",
        recycle_avg_credits: "재활용 1회당 평균 적립 크레딧",
        recycle_challenge_title: "🌱 그린 챌린지",
        recycle_challenge_desc: "이번 주 3번 재활용하면 추가로 100 크레딧을 드려요.",
        recycle_challenge_button: "챌린지 완료하기 +100",
        recycle_s1_name: "그린허브 님만",
        recycle_s1_meta: "0.9 km · 20:00까지 영업",
        recycle_s1_tags: "플라스틱 · 유리 · 종이",
        recycle_s2_name: "에코드롭 스테이션",
        recycle_s2_meta: "1.7 km · 18:00까지 영업",
        recycle_s2_tags: "배터리 · 전자폐기물",
        recycle_s3_name: "제로웨이스트 포인트",
        recycle_s3_meta: "2.4 km · 21:00까지 영업",
        recycle_s3_tags: "플라스틱 · 금속",
        recycle_s4_name: "커뮤니티 그린 포인트",
        recycle_s4_meta: "3.1 km · 19:00까지 영업",
        recycle_s4_tags: "모든 재활용품",

        transport_page_title: "🚗 친환경 이동",
        transport_page_desc: "전기차를 예약하고 실시간으로 기사님 위치를 확인하세요.",
        transport_driver_arriving: "기사님이 오고 있어요",
        transport_status_ready: "근처 전기차를 찾을 준비가 되었어요",
        transport_destination_question: "어디로 가시나요?",
        transport_pickup_placeholder: "출발 위치",
        transport_destination_placeholder: "목적지를 입력하세요",
        transport_choose_ev: "전기차를 선택하세요",
        transport_vehicle_car: "전기차",
        transport_vehicle_car_meta: "4인승 · 5분",
        transport_vehicle_taxi: "전기택시",
        transport_vehicle_taxi_meta: "4인승 · 3분",
        transport_vehicle_bike: "전기오토바이",
        transport_vehicle_bike_meta: "1인승 · 2분",
        transport_estimated_fare: "예상 요금",
        transport_co2_saved: "CO₂ 절감량",
        transport_call_ev_button: "🚗 전기차 호출",
        transport_driver_name: "알렉스 · 전기차 기사",
        transport_driver_rating: "⭐ 4.9 · 그린 드라이버",
        transport_driver_car: "BYD 돌핀 · EV-2048",
        transport_calling_driver: "기사님께 전화하는 중...",
        transport_opening_chat: "기사님과 채팅 시작...",
        transport_enter_destination: "목적지를 입력해 주세요.",
        transport_finding_driver: "근처 전기차 기사님을 찾는 중...",
        transport_finding_driver_short: "기사님을 찾는 중...",
        transport_driver_found: "기사님을 찾았어요 · 5분 후 도착",
        transport_on_the_way: "기사님이 오고 계세요",
        transport_driver_found_toast: "전기차 기사님을 찾았어요!",
        transport_driver_arrived: "기사님이 도착했어요",
        transport_arrived: "도착",
        transport_ev_arrived_toast: "전기차가 도착했어요!",
        transport_start_ride: "탑승 시작",
        transport_enjoy_ride: "즐거운 그린 라이드 되세요! 🌱",
        map_centered_toast: "현재 위치로 지도를 이동했어요.",
        map_zoom_in_toast: "확대하는 중...",
        map_zoom_out_toast: "축소하는 중...",

        used_page_title: "📦 중고 마켓",
        used_page_desc: "우리 동네에서 물건에 새로운 삶을 선물하세요.",
        used_search_placeholder: "중고 물품을 검색하세요...",
        used_contact_button: "연락하기",
        used_contact_toast: "판매자 연락 화면이 열렸어요",
        used_i1_name: "무선 헤드폰",
        used_i1_meta: "상태 좋음 · 0.7 km",
        used_i1_impact: "재사용 임팩트 +15",
        used_i2_name: "원목 스터디 의자",
        used_i2_meta: "거의 새것 · 1.4 km",
        used_i2_impact: "재사용 임팩트 +20",
        used_i3_name: "대학 교재 세트",
        used_i3_meta: "중고 · 1.9 km",
        used_i3_impact: "재사용 임팩트 +15",
        used_i4_name: "여행용 백팩",
        used_i4_meta: "매우 좋음 · 2.2 km",
        used_i4_impact: "재사용 임팩트 +15",

        wallet_page_title: "🌱 탄소 지갑",
        wallet_page_desc: "친환경 행동을 리워드로 바꿔보세요.",
        wallet_available_label: "사용 가능한 탄소 크레딧",
        wallet_green_score_label: "그린 점수",
        wallet_rank_desc: "이번 달 친환경 유저 상위 18%예요.",
        wallet_redeem_title: "🎁 리워드 교환",
        wallet_redeem_desc: "탄소 크레딧으로 친환경 리워드를 받아보세요.",
        wallet_reward1_name: "฿50 음식 할인",
        wallet_reward2_name: "🚲 무료 그린 라이드",
        wallet_reward3_name: "🍱 ฿100 음식 상품권",
        wallet_redeem_button: "교환하기",
        wallet_activity_title: "🌱 지속가능 활동",
        wallet_activity_desc: "나의 임팩트와 리워드를 확인하세요.",
        wallet_recent_credits_title: "최근 탄소 크레딧",
        wallet_activity_recycling: "♻️ 플라스틱 재활용",
        wallet_activity_transport: "🚗 친환경 이동",
        wallet_activity_food: "🍱 음식 구출",
        wallet_activity_discount: "🎁 음식 할인",
        wallet_green_score_panel_title: "🌍 그린 점수",
        wallet_rank_desc_short: "이번 달 친환경 유저 상위 18%예요.",
        wallet_weekly_challenge_button: "주간 챌린지 완료하기 +100",

        cart_title: "🛒 나의 주문",
        cart_subtitle: "결제 전에 담은 항목을 확인하세요.",
        cart_delivery_option_title: "배달 옵션",
        cart_delivery_standard: "🚴 일반",
        cart_delivery_standard_time: "25~35분",
        cart_delivery_priority: "⚡ 우선",
        cart_delivery_priority_time: "15~25분 · 더 빠른 매칭",
        cart_delivery_saver: "🌱 세이버",
        cart_delivery_saver_time: "35~50분 · 최저 배달비",
        cart_delivery_time_title: "배달 시간",
        cart_time_now: "지금",
        cart_time_now_desc: "최대한 빨리",
        cart_time_schedule: "예약",
        cart_time_schedule_desc: "배달 시간 선택",
        cart_time_pickup: "직접 픽업",
        cart_time_pickup_desc: "배달비 없이 픽업",
        cart_address_title: "📍 배달 주소",
        cart_address_current: "현재 위치",
        cart_address_change: "변경",
        cart_address_toast: "주소 선택 화면이 열렸어요",
        cart_payment_title: "💳 결제 수단",
        cart_payment_greenpay: "그린페이 지갑",
        cart_payment_card: "체크/신용카드",
        cart_payment_cash: "현금",
        cart_payment_cash_desc: "배달 시 기사님께 결제",
        cart_promo_title: "🏷️ 프로모션",
        cart_promo_placeholder: "프로모 코드를 입력하세요",
        cart_promo_apply: "적용",
        cart_group_order_title: "👥 함께 주문",
        cart_group_order_desc: "친구를 초대해서 함께 음식을 담아보세요.",
        cart_group_order_start: "시작하기",
        cart_note_title: "📝 가게에 남길 메모",
        cart_note_placeholder: "예: 양파 빼주세요, 덜 맵게...",
        cart_summary_food: "음식",
        cart_summary_delivery: "배달비",
        cart_summary_discount: "할인",
        cart_summary_total: "총액",
        cart_place_order_button: "주문하기",
        cart_empty_title: "장바구니가 비어있어요",
        cart_empty_desc: "먼저 구출 음식을 담아보세요.",
        cart_empty_toast: "장바구니가 비어있어요.",
        promo_green70_applied: "✓ GreenLoop 프로모 적용: 10% 추가 할인",
        promo_rescue100_applied: "✓ ฿30 구출 음식 할인 적용",
        promo_invalid: "유효하지 않은 프로모 코드예요",
        group_order_created_toast: "함께 주문이 생성됐어요! 친구에게 링크를 공유하세요.",
        order_placed_toast: "주문이 완료됐어요 · ฿{total}",
        not_enough_credits: "탄소 크레딧이 부족해요",
        credits_earned_toast: "+{amount} 탄소 크레딧을 획득했어요!",
        reward_redeemed_toast: "{reward} 교환이 완료됐어요!",

        order_confirmed_title: "주문이 확인됐어요!",
        order_confirmed_desc: "GreenLoop 주문을 준비하고 있어요.",
        tracking1_title: "주문 확인",
        tracking1_desc: "가게에서 주문을 받았어요",
        tracking2_title: "준비 중",
        tracking2_desc: "가게에서 음식을 준비하고 있어요",
        tracking3_title: "픽업 완료",
        tracking3_desc: "음식이 배달 중이에요",
        tracking4_title: "도착 예정",
        tracking4_desc: "곧 도착해요",
        tracking_driver_role: "⭐ 4.9 · 그린 배달 파트너",
        tracking_calling_partner: "배달 파트너께 전화하는 중...",
        tracking_help_toast: "주문 도움말 센터가 열렸어요",
        tracking_need_help: "도움이 필요하신가요?",
        tracking_preparing_toast: "가게에서 주문을 준비하고 있어요",
        tracking_picked_up_toast: "기사님이 주문을 픽업했어요",
        tracking_arriving_toast: "주문이 곧 도착해요",

        footer_tagline: "모든 지속가능한 행동에는 가치가 있어요.",
        login_modal_desc: "서비스를 이용하시려면 로그인이 필요합니다.",

        search_empty_toast: "음식, 재활용, 이동, 중고물품 등으로 검색해 보세요.",
        search_food_toast: "\"{q}\" 음식 검색 결과를 보여드려요",
        search_recycle_toast: "\"{q}\" 재활용 검색 결과를 보여드려요",
        search_transport_toast: "\"{q}\" 친환경 이동을 열었어요",
        search_used_toast: "\"{q}\" 마켓 검색 결과를 보여드려요",
        search_generic_toast: "GreenLoop에서 \"{q}\"을(를) 검색 중...",
        search_market_toast: "마켓에서 \"{q}\"을(를) 검색 중...",
        search_market_empty_toast: "검색할 항목을 입력해 주세요.",

        google_login_checking_toast: "Google 계정을 확인했습니다. 서버에 로그인하는 중입니다.",
        login_success_toast: "로그인되었습니다.",
        login_request_failed_toast: "로그인 요청 실패 ({status})",
        login_server_unreachable_toast: "로그인 서버(localhost:8080)에 연결할 수 없습니다. 백엔드를 실행해 주세요.",
        logout_success_toast: "로그아웃되었습니다."
    }

};

const LANGUAGE_STORAGE_KEY="greenloop_lang";

let currentLanguage=localStorage.getItem(LANGUAGE_STORAGE_KEY)||"en";

const languageChangeListeners=[];

// 페이지별 동적 콘텐츠(예: route.js가 클릭으로 다시 그리는 안내 문구)가
// 언어 변경 시 자신을 다시 렌더링할 수 있도록 등록하는 훅.
function onLanguageChange(callback){
    languageChangeListeners.push(callback);
}

function t(key){
    const dict=translations[currentLanguage]||translations.en;
    if(dict[key]!==undefined)return dict[key];
    return translations.en[key]!==undefined?translations.en[key]:key;
}

// t()에 {placeholder} 치환을 더한 버전. 예: tf("search_food_toast",{q:"pizza"})
function tf(key,vars){
    return t(key).replace(/\{(\w+)\}/g,(match,name)=>
        vars[name]!==undefined?vars[name]:match
    );
}

function applyTranslations(){
    document.querySelectorAll("[data-i18n]").forEach(el=>{
        el.innerHTML=t(el.dataset.i18n);
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(el=>{
        el.placeholder=t(el.dataset.i18nPlaceholder);
    });

    document.querySelectorAll("#language").forEach(select=>{
        select.value=currentLanguage;
    });
}

function setLanguage(lang,options={}){
    currentLanguage=lang;
    localStorage.setItem(LANGUAGE_STORAGE_KEY,lang);

    applyTranslations();

    languageChangeListeners.forEach(callback=>callback(lang));

    if(!options.silent){
        toast(t("language_changed_toast"));
    }
}

document.addEventListener("DOMContentLoaded",()=>{
    setLanguage(currentLanguage,{silent:true});
});

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
    
    toast(t("google_login_checking_toast"));

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
            toast(t("login_success_toast"));
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
                toast(data.message || data.error || tf("login_request_failed_toast",{status:res.status}));
            }
        }
    } catch (error) {
        console.error("통신 실패:", error);
        toast(t("login_server_unreachable_toast"));
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

        toast(t("logout_success_toast"));
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
        toast(t("restaurant_setup_missing_fields"));
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

        toast(t("restaurant_setup_success_toast"));

        document.getElementById("restaurantSetupForm").style.display="none";
        document.getElementById("foodRegisterForm").style.display="block";
        document.getElementById("myRestaurantName").textContent=data.name;

    }catch(error){
        console.error("가게 등록 실패:",error);
        toast(t("restaurant_setup_failed_toast"));
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

    preview.textContent=tf("food_register_price_preview",{price:discountedPrice});
}

async function submitFoodRegistration(){

    if(!myRestaurant){
        toast(t("food_register_need_restaurant_toast"));
        return;
    }

    const title=document.getElementById("registerFoodTitle").value.trim();
    const description=document.getElementById("registerFoodDescription").value.trim();
    const originalPrice=Number(document.getElementById("registerFoodOriginalPrice").value);
    const discountRate=Number(document.getElementById("registerFoodDiscountRate").value)||0;
    const category=document.getElementById("registerFoodCategory").value;
    const imageFile=document.getElementById("registerFoodImage").files[0];

    if(!title||!originalPrice||!imageFile){
        toast(t("food_register_missing_fields"));
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

        toast(tf("food_register_success_toast",{title:data.title}));

        showPage("food");
        showAllFoodItems();

    }catch(error){
        console.error("음식 등록 실패:",error);
        toast(t("food_register_failed_toast")+": "+(error.message||t("try_again")));
    }
}


/* =========================================================
   INIT
========================================================= */

updateBalance();
