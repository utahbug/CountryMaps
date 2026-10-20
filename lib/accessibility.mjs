// Shared focus behavior for native non-modal popovers and same-page navigation.
export function installAccessibility(root){
 root.tabIndex=-1;
 document.querySelector('.skip-link')?.addEventListener('click',event=>{event.preventDefault();root.focus();root.scrollIntoView({block:'start'});});
 const openers=new WeakMap();
 document.addEventListener('beforetoggle',event=>{
  const panel=event.target;if(!panel.hasAttribute?.('popover'))return;
  if(event.newState==='open')openers.set(panel,document.activeElement);
 },true);
 document.addEventListener('toggle',event=>{
  const panel=event.target;if(!panel.hasAttribute?.('popover'))return;
  if(event.newState==='open'){
   const first=panel.querySelector('button:not([disabled]),a[href],input,select,[tabindex="0"]');
   first?.focus({preventScroll:true});
  }else{
   const opener=openers.get(panel),active=document.activeElement;
   if(opener?.isConnected&&(panel.contains(active)||active===document.body))opener.focus({preventScroll:true});
  }
 },true);
}
