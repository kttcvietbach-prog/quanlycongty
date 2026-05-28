
    let grSearchQuery = '';
    let grActiveTab = 'all';
    let goodsReceipts = [];

    try {
        const savedGR = JSON.parse(localStorage.getItem('erp_goodsReceipts'));
        if (savedGR && Array.isArray(savedGR)) {
            goodsReceipts = savedGR;
        }
    } catch (e) { }
