/* ==========================================================================
   HOUSE OF CHIKANKARI - MAIN JAVASCRIPT
   Description: Dynamic features for the House of Chikankari single-page web app.
   Author: Web Development Student Assignment Project
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    
    // ==========================================
    // 1. ANNOUNCEMENT BAR ROTATOR
    // ==========================================
    const announcements = [
        "✨ New Lucknowi Chikankari Collection just arrived! Explore now.",
        "🚚 Free home measurement booking in Delhi NCR this week!",
        "👑 Experience royal elegance with our premium hand-embroidered collection."
    ];
    let currentAnnouncementIdx = 0;
    const announcementTextEl = document.getElementById("announcement-text");

    if (announcementTextEl) {
        setInterval(() => {
            // Fade out
            announcementTextEl.style.opacity = 0;
            
            setTimeout(() => {
                // Change text and fade back in
                currentAnnouncementIdx = (currentAnnouncementIdx + 1) % announcements.length;
                announcementTextEl.textContent = announcements[currentAnnouncementIdx];
                announcementTextEl.style.opacity = 1;
            }, 500); // Half a second transition overlap
        }, 4000); // Rotate every 4 seconds
    }


    // ==========================================
    // 2. MOBILE NAVIGATION HAMBURGER DRAWER
    // ==========================================
    const hamburgerBtn = document.getElementById("hamburger");
    const navMenu = document.getElementById("nav-menu");
    const navLinks = document.querySelectorAll(".nav-link");

    if (hamburgerBtn && navMenu) {
        // Toggle active menu class on click
        hamburgerBtn.addEventListener("click", () => {
            navMenu.classList.toggle("active");
            
            // Toggle hamburger icon between bars and close X
            const icon = hamburgerBtn.querySelector("i");
            if (navMenu.classList.contains("active")) {
                icon.className = "fa-solid fa-xmark";
            } else {
                icon.className = "fa-solid fa-bars";
            }
        });

        // Close drawer immediately when any navigation link is clicked
        navLinks.forEach(link => {
            link.addEventListener("click", () => {
                navMenu.classList.remove("active");
                const icon = hamburgerBtn.querySelector("i");
                icon.className = "fa-solid fa-bars";
                
                // Update active state in nav link styles
                navLinks.forEach(item => item.classList.remove("active"));
                link.classList.add("active");
            });
        });
    }

    // Update active nav link based on scroll position
    window.addEventListener("scroll", () => {
        let currentSection = "";
        const sections = document.querySelectorAll("section");
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            if (pageYOffset >= sectionTop) {
                currentSection = section.getAttribute("id");
            }
        });

        navLinks.forEach(link => {
            link.classList.remove("active");
            if (link.getAttribute("href") === `#${currentSection}`) {
                link.classList.add("active");
            }
        });
    });


    // ==========================================
    // 3. WISHLIST FAVORITES SYSTEM (localStorage)
    // ==========================================
    const wishlistCountBadge = document.getElementById("wishlist-count");
    const wishlistButtons = document.querySelectorAll(".wishlist-btn");
    
    // Load favorites array from LocalStorage (or initialize empty array)
    let favoritesList = JSON.parse(localStorage.getItem("nawabi_wishlist")) || [];

    // Helper: update wishlist count badge inside navbar
    const updateWishlistBadge = () => {
        if (wishlistCountBadge) {
            wishlistCountBadge.textContent = favoritesList.length;
        }
    };

    // Helper: set initial heart icons styling based on storage on load
    const initializeWishlistIcons = () => {
        wishlistButtons.forEach(btn => {
            const productId = btn.getAttribute("data-id");
            const icon = btn.querySelector("i");
            
            if (favoritesList.includes(productId)) {
                btn.classList.add("favorited");
                icon.className = "fa-solid fa-heart"; // Filled heart
            } else {
                btn.classList.remove("favorited");
                icon.className = "fa-regular fa-heart"; // Outline heart
            }
        });
        updateWishlistBadge();
    };

    // Wishlist click handler
    wishlistButtons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault(); // Stop links or anchors from firing
            const productId = btn.getAttribute("data-id");
            const icon = btn.querySelector("i");

            if (favoritesList.includes(productId)) {
                // Remove from favorites list
                favoritesList = favoritesList.filter(id => id !== productId);
                btn.classList.remove("favorited");
                icon.className = "fa-regular fa-heart";
            } else {
                // Add to favorites list
                favoritesList.push(productId);
                btn.classList.add("favorited");
                icon.className = "fa-solid fa-heart";
            }

            // Sync with localStorage
            localStorage.setItem("nawabi_wishlist", JSON.stringify(favoritesList));
            updateWishlistBadge();
            
            // Sync with wishlist drawer in real-time
            if (typeof renderWishlistDrawerItems === "function") {
                renderWishlistDrawerItems();
            }
        });
    });

    // Initialize wishlist on script startup
    initializeWishlistIcons();


    // ==========================================
    // 4. COLLECTIONS SHIFT FILTER
    // ==========================================
    const filterButtons = document.querySelectorAll(".filter-btn");
    const productCards = document.querySelectorAll(".product-card");

    filterButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            // Remove active style from other filter buttons
            filterButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            const filterCategory = btn.getAttribute("data-filter");

            // Loop cards and show/hide accordingly
            productCards.forEach(card => {
                const cardCategory = card.getAttribute("data-category");

                if (filterCategory === "all") {
                    card.style.display = "flex";
                } else if (filterCategory === "stitched" && cardCategory === "stitched") {
                    card.style.display = "flex";
                } else if (filterCategory === "unstitched" && cardCategory === "unstitched") {
                    card.style.display = "flex";
                } else {
                    // Hide any cards that do not match current category
                    card.style.display = "none";
                }
            });
        });
    });


    // ==========================================
    // 5. STITCHING & CUSTOM TAILORING BOOKING
    // ==========================================
    const datePicker = document.getElementById("measurement-date");
    const timeSlotBtns = document.querySelectorAll(".time-slot-btn");
    const selectedSlotInput = document.getElementById("selected-time-slot");
    const measurementForm = document.getElementById("measurement-form");
    const bookingSuccessBox = document.getElementById("booking-success");
    const resetBookingBtn = document.getElementById("reset-booking-btn");
    const confirmBookingBtn = document.getElementById("confirm-booking-btn");
    
    // Doorstep Stitching Hookups
    const sendToStitchingBtns = document.querySelectorAll(".send-to-stitching-btn");
    const selectedProductGroup = document.getElementById("selected-product-group");
    const selectedFabricsListEl = document.getElementById("selected-fabrics-list");
    let selectedFabrics = []; // Array of { name: string, qty: number }

    // Helper: render selected fabrics list inside the booking form
    const renderSelectedFabrics = () => {
        if (!selectedFabricsListEl || !selectedProductGroup) return;

        if (selectedFabrics.length === 0) {
            selectedProductGroup.style.display = "none";
            selectedFabricsListEl.innerHTML = "";
            return;
        }

        selectedProductGroup.style.display = "block";
        selectedFabricsListEl.innerHTML = "";

        selectedFabrics.forEach(item => {
            const badge = document.createElement("div");
            badge.className = "selected-product-badge";
            badge.innerHTML = `
                <i class="fa-solid fa-scissors"></i>
                <span>${item.name} (Qty: ${item.qty})</span>
                <button type="button" class="remove-product" data-fabric="${item.name}" title="Remove this fabric">&times;</button>
            `;

            // Bind click event to remove this specific fabric
            badge.querySelector(".remove-product").addEventListener("click", () => {
                removeFabricFromStitching(item.name);
            });

            selectedFabricsListEl.appendChild(badge);
        });
    };

    const addFabricToStitching = (fabricName, qty = 1) => {
        const existingItem = selectedFabrics.find(item => item.name === fabricName);
        if (existingItem) {
            existingItem.qty += qty;
        } else {
            selectedFabrics.push({ name: fabricName, qty: qty });
        }
        renderSelectedFabrics();
    };

    const removeFabricFromStitching = (fabricName) => {
        selectedFabrics = selectedFabrics.filter(item => item.name !== fabricName);
        renderSelectedFabrics();
    };

    // Set minimum date picker target to today
    if (datePicker) {
        const today = new Date();
        const yyyy = today.getFullYear();
        let mm = today.getMonth() + 1; // Months start at 0
        let dd = today.getDate();

        if (mm < 10) mm = '0' + mm;
        if (dd < 10) dd = '0' + dd;

        datePicker.min = `${yyyy}-${mm}-${dd}`;
    }

    // Time slots selection highlight logic
    timeSlotBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            timeSlotBtns.forEach(b => b.classList.remove("selected"));
            btn.classList.add("selected");
            selectedSlotInput.value = btn.getAttribute("data-slot");
        });
    });

    // "Send for Stitching" logic on Product Cards
    sendToStitchingBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const fabricName = btn.getAttribute("data-product");
            addFabricToStitching(fabricName, 1);
        });
    });

    // Confirm tailors booking form submission logic
    if (measurementForm && confirmBookingBtn) {
        measurementForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const chosenDateStr = datePicker.value;
            const chosenSlot = selectedSlotInput.value;

            // Form validation
            if (!chosenDateStr) {
                alert("Please select a preferred date for the measurement.");
                return;
            }
            if (!chosenSlot) {
                alert("Please select a preferred time slot.");
                return;
            }

            // Date processing logic
            const chosenDate = new Date(chosenDateStr);
            
            // Format Booking Date: e.g. "Monday, June 15, 2026"
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            const formattedBookingDate = chosenDate.toLocaleDateString('en-US', options);

            // Calculate estimated delivery date: selected measurement date + 6 days
            const deliveryDate = new Date(chosenDate);
            deliveryDate.setDate(chosenDate.getDate() + 6);
            const formattedDeliveryDate = deliveryDate.toLocaleDateString('en-US', options);

            // Populate Success Confirmation Card details
            document.getElementById("success-date").textContent = formattedBookingDate;
            document.getElementById("success-slot").textContent = chosenSlot;
            
            const successProductRow = document.getElementById("success-product-row");
            const successProductEl = document.getElementById("success-product");
            
            if (selectedFabrics.length > 0 && successProductRow && successProductEl) {
                successProductEl.textContent = selectedFabrics.map(item => `${item.name} (Qty: ${item.qty})`).join(", ");
                successProductRow.style.display = "flex";
            } else if (successProductRow) {
                successProductRow.style.display = "none";
            }

            document.getElementById("success-delivery-date").textContent = formattedDeliveryDate;

            // Swap forms visible states
            measurementForm.style.display = "none";
            bookingSuccessBox.style.display = "block";
        });
    }

    // Reset tailoring booking form handler
    if (resetBookingBtn && measurementForm) {
        resetBookingBtn.addEventListener("click", () => {
            // Reset input values
            measurementForm.reset();
            selectedSlotInput.value = "";
            timeSlotBtns.forEach(b => b.classList.remove("selected"));
            
            selectedFabrics = [];
            renderSelectedFabrics();

            // Restore form layout
            bookingSuccessBox.style.display = "none";
            measurementForm.style.display = "block";
        });
    }


    // ==========================================
    // 6. FAQ ACCORDION EXPANSIONS
    // ==========================================
    const faqQuestions = document.querySelectorAll(".faq-question");

    faqQuestions.forEach(btn => {
        btn.addEventListener("click", () => {
            const faqItem = btn.parentElement;
            const faqAnswer = faqItem.querySelector(".faq-answer");
            const isActive = faqItem.classList.contains("active");

            // Close all other FAQ items first
            document.querySelectorAll(".faq-item").forEach(item => {
                item.classList.remove("active");
                item.querySelector(".faq-answer").style.maxHeight = null;
            });

            // Toggle active status on click
            if (!isActive) {
                faqItem.classList.add("active");
                // Set max height dynamically based on element scrollHeight
                faqAnswer.style.maxHeight = faqAnswer.scrollHeight + "px";
            }
        });
    });


    // ==========================================
    // 7. CONTACT FORM SIMULATED SUBMISSION
    // ==========================================
    const contactForm = document.getElementById("contact-form");
    const contactSuccessBox = document.getElementById("contact-success");
    const resetContactBtn = document.getElementById("reset-contact-btn");

    if (contactForm && contactSuccessBox) {
        contactForm.addEventListener("submit", (e) => {
            e.preventDefault();
            
            // Standard client side validation helper checks
            const name = document.getElementById("contact-name").value.trim();
            const phone = document.getElementById("contact-phone").value.trim();
            const email = document.getElementById("contact-email").value.trim();
            const message = document.getElementById("contact-message").value.trim();

            if (!name || !phone || !message) {
                alert("Please fill in all the required fields.");
                return;
            }

            // Hide normal form layout, show success box
            contactForm.style.display = "none";
            contactSuccessBox.style.display = "block";
        });
    }

    if (resetContactBtn && contactForm) {
        resetContactBtn.addEventListener("click", () => {
            contactForm.reset();
            contactSuccessBox.style.display = "none";
            contactForm.style.display = "block";
        });
    }

    // ==========================================
    // 8. PRODUCT DETAILS MODAL & CHAIN ORDER FLOW
    // ==========================================
    const productsData = {
        "suit-1": {
            title: "Royal Blush Chikankari Suit Set",
            tag: "Stitched Suits",
            stitchStatus: "Fully Stitched (Ready-to-Wear)",
            isStitched: true,
            desc: "This elegant royal blush pink Chikankari salwar suit set features rich handwoven Lucknowi embroidery details across the chest and borders. Tailored to perfection, it offers premium quality georgette material with a comfortable inner lining, matching palazzo pants, and a sheer embroidered dupatta.",
            fabric: "Premium Georgette with Cotton Lining. Pack includes fully tailored Kurta, Bottom, and Dupatta.",
            images: [
                "assets/suit1_1.jpg",
                "assets/suit1_2.jpg",
                "assets/suit1_3.jpg",
                "assets/suit1_4.jpg"
            ]
        },
        "fabric-1": {
            title: "Ivory Grace Chikankari Suit Material",
            tag: "Unstitched Fabric",
            stitchStatus: "Unstitched Material (Free Stitching Available)",
            isStitched: false,
            desc: "This unstitched 3-piece suit material collection showcases traditional Lucknow shadow-work Chikankari on soft ivory-colored georgette. Hand-embroidered by generations of experienced craftsmen, this premium fabric allows you to tailor your ethnic outfit exactly to your body shape.",
            fabric: "Pure Georgette Kurta (3m), Cotton Bottom (2.5m), and Chiffon Dupatta (2.5m). Includes Lucknowi embroidery motifs.",
            images: [
                "assets/suit%201_5.jpg",
                "assets/suit%201_6.jpg"
            ]
        },
        "suit-2": {
            title: "Peach Anarkali Georgette Suit",
            tag: "Stitched Suits",
            stitchStatus: "Fully Stitched (Ready-to-Wear)",
            isStitched: true,
            desc: "A stunning floor-length Anarkali stitched dress in pastel peach. Featuring heavy traditional Lucknowi embroidery around the neck, waist, and flared border. Made with premium quality fabrics that look extremely regal at weddings, festivals, or family functions.",
            fabric: "Georgette with soft crepe inner lining. Pack includes fully stitched Anarkali Kurta, Churidar Pants, and Dupatta.",
            images: [
                "assets/suit%201_7.jpg",
                "assets/suit%201_8.jpg"
            ]
        },
        "fabric-2": {
            title: "Sage Breeze Chikankari Suit Fabric",
            tag: "Unstitched Fabric",
            stitchStatus: "Unstitched Material (Free Stitching Available)",
            isStitched: false,
            desc: "Pure cotton unstitched suit material in a refreshing, soft sage green shade. Breathable, comfortable fabric designed for daily wear or formal events, highlighted by delicate white thread hand-embroidery patterns.",
            fabric: "100% Breathable Cotton. Kurta fabric (3m), pants fabric (2.5m), and light mulmul dupatta (2.5m).",
            images: [
                "assets/suit%201_9.jpg",
                "assets/suit%201_10.jpg"
            ]
        },
        "cat-kurtis": {
            title: "Kurti & Tunic Collection",
            tag: "Designer Kurtis",
            stitchStatus: "Fully Stitched (Daily Wear)",
            isStitched: true,
            desc: "Our designer kurtis represent contemporary style blended with ethnic motifs. Made with lightweight premium cotton, these kurtis are ideal for daily work, college, or semi-formal meetups. They pair beautifully with jeans or leggings.",
            fabric: "Premium Cotton, fully stitched with floral embroidery and designer necklines.",
            images: [
                "assets/suit%201_11.jpg",
                "assets/suit%201_12.jpg"
            ]
        },
        "cat-sarees": {
            title: "Regal Lucknowi Chikankari Sarees",
            tag: "Sarees",
            stitchStatus: "Unstitched Saree & Blouse Material",
            isStitched: false,
            desc: "Wrap yourself in 6 yards of pure elegance. Our Lucknowi sarees feature delicate hand-embroidery motifs spread across the entire body, with a heavy and ornate pallu. Comes with matching unstitched blouse fabric.",
            fabric: "Organza or georgette saree (5.5m) + matching unstitched blouse fabric (80cm).",
            images: [
                "assets/suit%201_13.jpg",
                "assets/suit%201_14.jpg"
            ]
        },
        "cat-cordsets": {
            title: "Chic Embroidered Cord Sets",
            tag: "Cord Sets",
            stitchStatus: "Fully Stitched (Modern Silhouette)",
            isStitched: true,
            desc: "Modern co-ord matching sets featuring ethnic handblock prints and subtle Lucknowi Chikankari details. A perfect blend of a contemporary silhouette and traditional roots.",
            fabric: "Premium Rayon-cotton blend, fully tailored matching top and bottom set.",
            images: [
                "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=600"
            ]
        },
        "cat-bedsheets": {
            title: "Lucknowi Handblock Bedsheets",
            tag: "Bedsheets",
            stitchStatus: "Home Decor",
            isStitched: false,
            desc: "Premium cotton double bedsheets with traditional handblock printing, Lucknowi motifs, and matching pillow covers. Brighten your bedroom with these handcrafted designs.",
            fabric: "100% Cotton, fits standard double beds, comes with 2 pillow covers.",
            images: [
                "assets/suit%201_15.jpg"
            ]
        },
        "cat-gents": {
            title: "Gents Lucknowi Shirts & Kurtas",
            tag: "Gents Wear",
            stitchStatus: "Fully Stitched",
            isStitched: true,
            desc: "Formal and casual ethnic kurtas and shirts for gents, decorated with subtle hand-embroidery around the collar and button placket. Elegant styling designed to elevate men's ethnic wardrobe.",
            fabric: "Pure linen-cotton blend. Breathable, comfortable, and tailored fit.",
            images: [
                "assets/suit%201_16.jpg"
            ]
        }
    };

    // Select the modal elements
    const productModal = document.getElementById("product-modal");
    const modalCloseBtn = document.getElementById("modal-close");
    const modalMainImg = document.getElementById("modal-main-img");
    const modalThumbnailsContainer = document.getElementById("modal-thumbnails");
    const modalProductTag = document.getElementById("modal-product-tag");
    const modalProductTitle = document.getElementById("modal-product-title");
    const modalStitchStatus = document.getElementById("modal-stitch-status");
    const modalProductDesc = document.getElementById("modal-product-desc");
    const modalProductFabric = document.getElementById("modal-product-fabric");
    const modalFabricRow = document.getElementById("modal-fabric-row");
    
    const qtyInput = document.getElementById("qty-input");
    const qtyMinusBtn = document.getElementById("qty-minus");
    const qtyPlusBtn = document.getElementById("qty-plus");
    const modalAddToCartBtn = document.getElementById("modal-add-to-cart-btn");
    
    const modalStep1 = document.getElementById("modal-step-1");
    const modalStep2 = document.getElementById("modal-step-2");
    
    const promptProductSummary = document.getElementById("prompt-product-summary");
    const promptQtySummary = document.getElementById("prompt-qty-summary");
    const promptBtnYes = document.getElementById("prompt-btn-yes");
    const promptBtnNo = document.getElementById("prompt-btn-no");
    const backToDetailsBtn = document.getElementById("back-to-details");

    let currentOpenProductId = null;

    // Attach click events to cards
    const cards = document.querySelectorAll(".product-card");
    cards.forEach(card => {
        card.addEventListener("click", (e) => {
            // If the user clicked the wishlist button, do not open the modal
            if (e.target.closest(".wishlist-btn")) {
                return;
            }

            // If the user clicked the Add to Cart button on the card, open the modal
            if (e.target.closest(".add-to-cart-card-btn")) {
                const productId = e.target.closest(".add-to-cart-card-btn").getAttribute("data-id");
                openProductModal(productId);
                return;
            }

            // If the user clicked the Inquire Now button on the card, pre-fill contact form
            if (e.target.closest(".inquire-card-btn")) {
                const inquireBtn = e.target.closest(".inquire-card-btn");
                const productId = inquireBtn.getAttribute("data-id");
                const product = productsData[productId];
                if (product) {
                    const contactMsgEl = document.getElementById("contact-message");
                    if (contactMsgEl) {
                        contactMsgEl.value = `Hello! I would like to inquire about the "${product.title}" (${product.tag}). Please share pricing and catalog details.`;
                    }
                }
                return; // Let the default anchor href="#contact" take care of smooth scrolling
            }

            // If they clicked other buttons or links, do not open modal
            if (e.target.closest(".btn") || e.target.closest("a")) {
                return;
            }

            const wishlistBtn = card.querySelector(".wishlist-btn");
            if (!wishlistBtn) return;
            const productId = wishlistBtn.getAttribute("data-id");
            openProductModal(productId);
        });
    });

    const openProductModal = (productId) => {
        const product = productsData[productId];
        if (!product) return;

        currentOpenProductId = productId;
        
        // Reset steps view
        modalStep1.style.display = "block";
        modalStep2.style.display = "none";
        qtyInput.value = 1;

        // Populating basic data
        modalProductTag.textContent = product.tag;
        modalProductTitle.textContent = product.title;
        modalStitchStatus.textContent = product.stitchStatus;
        modalProductDesc.textContent = product.desc;
        modalProductFabric.textContent = product.fabric;

        // If there's no fabric info, hide the fabric row
        if (product.fabric) {
            modalFabricRow.style.display = "block";
        } else {
            modalFabricRow.style.display = "none";
        }

        // Set Stitching Decision Prompt text depending on whether it is stitched
        const promptQuestion = document.querySelector(".prompt-question");
        if (product.isStitched) {
            promptQuestion.textContent = "Would you like to book our doorstep measurement and styling consultation service to ensure a flawless custom fit for your readymade outfit?";
        } else {
            promptQuestion.textContent = "Would you like to add custom stitching and doorstep measurement service for this unstitched fabric?";
        }

        // Populate images
        if (product.images && product.images.length > 0) {
            modalMainImg.src = product.images[0];
            modalThumbnailsContainer.innerHTML = "";

            product.images.forEach((imgUrl, idx) => {
                const thumb = document.createElement("div");
                thumb.className = `modal-thumb ${idx === 0 ? 'active' : ''}`;
                thumb.innerHTML = `<img src="${imgUrl}" alt="${product.title} view ${idx + 1}">`;
                
                thumb.addEventListener("click", () => {
                    document.querySelectorAll(".modal-thumb").forEach(t => t.classList.remove("active"));
                    thumb.classList.add("active");
                    modalMainImg.src = imgUrl;
                });
                
                modalThumbnailsContainer.appendChild(thumb);
            });
        }

        // Display modal
        productModal.classList.add("active");
        document.body.style.overflow = "hidden"; // Disable background scrolling
    };

    const closeProductModal = () => {
        productModal.classList.remove("active");
        document.body.style.overflow = "auto"; // Re-enable background scrolling
        currentOpenProductId = null;
    };

    // Close events
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener("click", closeProductModal);
    }
    
    window.addEventListener("click", (e) => {
        if (e.target === productModal) {
            closeProductModal();
        }
    });

    // Quantity selectors
    if (qtyMinusBtn && qtyPlusBtn && qtyInput) {
        qtyMinusBtn.addEventListener("click", () => {
            let val = parseInt(qtyInput.value);
            if (val > 1) {
                qtyInput.value = val - 1;
            }
        });

        qtyPlusBtn.addEventListener("click", () => {
            let val = parseInt(qtyInput.value);
            qtyInput.value = val + 1;
        });
    }

    // Add to Cart -> Step 2
    if (modalAddToCartBtn) {
        modalAddToCartBtn.addEventListener("click", () => {
            const product = productsData[currentOpenProductId];
            if (!product) return;

            // Populate step 2 summary details
            promptProductSummary.textContent = product.title;
            promptQtySummary.textContent = qtyInput.value;

            // Transition slides
            modalStep1.style.display = "none";
            modalStep2.style.display = "block";
        });
    }

    // Go back to details (Step 2 -> Step 1)
    if (backToDetailsBtn) {
        backToDetailsBtn.addEventListener("click", () => {
            modalStep2.style.display = "none";
            modalStep1.style.display = "block";
        });
    }

    // Handle Stitching Options in Step 2
    if (promptBtnYes) {
        promptBtnYes.addEventListener("click", () => {
            const product = productsData[currentOpenProductId];
            closeProductModal();

            // Add fabric to measurement form selected items list with quantity
            if (product) {
                const qty = parseInt(qtyInput.value) || 1;
                addFabricToStitching(product.title, qty);
            }

            // Scroll to the stitching section smoothly
            const stitchingSection = document.getElementById("stitching");
            if (stitchingSection) {
                stitchingSection.scrollIntoView({ behavior: "smooth" });
                
                // Focus on the date picker after a small scroll delay
                setTimeout(() => {
                    if (datePicker) {
                        datePicker.focus();
                    }
                }, 800);
            }
        });
    }

    if (promptBtnNo) {
        promptBtnNo.addEventListener("click", () => {
            const product = productsData[currentOpenProductId];
            closeProductModal();

            // Show a simple success notification
            alert(`Success! Added ${qtyInput.value} x ${product.title} to your cart. We will ship the unstitched fabric package to you.`);
        });
    }

    // ==========================================
    // 9. WISHLIST SIDE DRAWER CONTROLLER
    // ==========================================
    const wishlistDrawerOverlay = document.getElementById("wishlist-drawer-overlay");
    const wishlistDrawerCloseBtn = document.getElementById("wishlist-drawer-close");
    const wishlistEmptyEl = document.getElementById("wishlist-empty");
    const wishlistItemsContainer = document.getElementById("wishlist-items-container");
    const exploreBtnWishlist = document.getElementById("explore-btn-wishlist");
    const wishlistBadgeBtn = document.querySelector(".wishlist-badge-btn");

    // Open wishlist side drawer
    const openWishlistDrawer = () => {
        renderWishlistDrawerItems();
        if (wishlistDrawerOverlay) {
            wishlistDrawerOverlay.style.display = "block";
            // Forces reflow to trigger CSS transitions properly
            wishlistDrawerOverlay.offsetHeight;
            wishlistDrawerOverlay.classList.add("active");
            document.body.style.overflow = "hidden"; // Disable background scrolling
        }
    };

    // Close wishlist side drawer
    const closeWishlistDrawer = () => {
        if (wishlistDrawerOverlay) {
            wishlistDrawerOverlay.classList.remove("active");
            document.body.style.overflow = "auto"; // Re-enable background scrolling
            // Wait for transition to finish before hiding display
            setTimeout(() => {
                if (!wishlistDrawerOverlay.classList.contains("active")) {
                    wishlistDrawerOverlay.style.display = "none";
                }
            }, 350);
        }
    };

    // Render favorited items inside the drawer
    const renderWishlistDrawerItems = () => {
        if (!wishlistEmptyEl || !wishlistItemsContainer) return;

        if (favoritesList.length === 0) {
            wishlistEmptyEl.style.display = "flex";
            wishlistItemsContainer.style.display = "none";
            return;
        }

        wishlistEmptyEl.style.display = "none";
        wishlistItemsContainer.style.display = "flex";
        wishlistItemsContainer.innerHTML = "";

        favoritesList.forEach(productId => {
            const product = productsData[productId];
            if (!product) return;

            const card = document.createElement("div");
            card.className = "wishlist-item-card";
            card.innerHTML = `
                <img src="${product.images[0]}" alt="${product.title}" class="wishlist-item-img">
                <div class="wishlist-item-details">
                    <span class="wishlist-item-tag">${product.tag}</span>
                    <h4 class="wishlist-item-title">${product.title}</h4>
                    <div class="wishlist-item-actions">
                        <button type="button" class="btn btn-gold btn-small view-details-wishlist-btn">View Details</button>
                    </div>
                </div>
                <button type="button" class="wishlist-item-remove-btn" title="Remove from wishlist">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            `;

            // Bind click to open details modal
            card.querySelector(".view-details-wishlist-btn").addEventListener("click", () => {
                closeWishlistDrawer();
                openProductModal(productId);
            });

            // Bind click to remove item
            card.querySelector(".wishlist-item-remove-btn").addEventListener("click", () => {
                removeFromWishlist(productId);
            });

            wishlistItemsContainer.appendChild(card);
        });
    };

    // Helper: remove product from wishlist
    const removeFromWishlist = (productId) => {
        favoritesList = favoritesList.filter(id => id !== productId);
        localStorage.setItem("nawabi_wishlist", JSON.stringify(favoritesList));
        initializeWishlistIcons(); // Synchronizes product page heart shapes
        renderWishlistDrawerItems(); // Re-renders drawer contents
    };

    // Bind Wishlist Drawer trigger events
    if (wishlistBadgeBtn) {
        wishlistBadgeBtn.addEventListener("click", (e) => {
            e.preventDefault();
            openWishlistDrawer();
        });
    }

    if (wishlistDrawerCloseBtn) {
        wishlistDrawerCloseBtn.addEventListener("click", closeWishlistDrawer);
    }

    // Close on overlay click
    if (wishlistDrawerOverlay) {
        wishlistDrawerOverlay.addEventListener("click", (e) => {
            if (e.target === wishlistDrawerOverlay) {
                closeWishlistDrawer();
            }
        });
    }

    // Close and scroll on "Explore Collections" button click
    if (exploreBtnWishlist) {
        exploreBtnWishlist.addEventListener("click", () => {
            closeWishlistDrawer();
        });
    }

    // Define globally to allow other sections to reference
    window.renderWishlistDrawerItems = renderWishlistDrawerItems;
});
