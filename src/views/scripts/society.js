const paymentModal=document.getElementById('paymentModal');
const claimModal=document.getElementById('claimModal');
const payNowBtn=document.getElementById('payNowBtn');
const submitClaimBtn=document.getElementById('submitClaimBtn');
const closePaymentModal=document.getElementById('closePaymentModal');
const closeClaimModal=document.getElementById('closeClaimModal');

payNowBtn.addEventListener('click',()=>{
    paymentModal.classList.add('active');
});


submitClaimBtn.addEventListener('click',()=>{
    claimModal.classList.add('active');
});

closePaymentModal.addEventListener('click',()=>{
    paymentModal.classList.remove('active');
});


closeClaimModal.addEventListener('click',()=>{
    claimModal.classList.remove('active');
});


paymentModal.addEventListener('click',(e)=>{
    if(e.target===paymentModal){
        paymentModal.classList.remove('active');
    }
});

claimModal.addEventListener('click',(e)=>{
    if(e.target===claimModal){
        claimModal.classList.remove('active');
    }
});

document.addEventListener('keydown',(e)=>{
    if(e.key==='Escape'){
        paymentModal.classList.remove('active');
        claimModal.classList.remove('active');
    }
});

document.querySelectorAll('form').forEach(form=>{
    form.addEventListener('submit',(e)=>{
        e.preventDefault();
        
        alert('Submitted successfully!');
        
        paymentModal.classList.remove('active');
        claimModal.classList.remove('active');
    });
});