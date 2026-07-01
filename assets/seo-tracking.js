(function(){
  function safe(v){return String(v||'').replace(/[^a-zA-Z0-9_]+/g,'_').slice(0,48)}
  function eid(p){return p+'_'+Date.now()+'_'+Math.random().toString(36).slice(2)}
  function campaignUrl(path,source){
    var keys=['utm_source','utm_medium','utm_campaign','utm_content','utm_term','message'];
    var params=new URLSearchParams(location.search);
    var url=new URL(path,location.origin);
    keys.forEach(function(k){var v=params.get(k);if(v)url.searchParams.set(k,v)});
    if(source)url.searchParams.set('source',source);
    return url.pathname+url.search;
  }
  function cleanText(value){return String(value||'').replace(/\s+/g,' ').trim()}
  function addStructuredData(){
    var canonical=document.querySelector('link[rel="canonical"]');
    var pageUrl=canonical?canonical.href:location.href.split('#')[0];
    var title=cleanText((document.querySelector('h1')||{}).textContent)||document.title||'Sacramento Battery Incentive';
    var data={
      '@context':'https://schema.org',
      '@graph':[
        {'@type':'WebSite','@id':'https://sacramentobatteryincentive.com/#website','url':'https://sacramentobatteryincentive.com/','name':'Sacramento Battery Incentive','inLanguage':'en-US'},
        {'@type':'Organization','@id':'https://sacramentobatteryincentive.com/#organization','name':'Sacramento Battery Incentive','url':'https://sacramentobatteryincentive.com/','telephone':'+1-385-777-9692','sameAs':['https://axiasolarusa.com/locations/california/sacramento/']},
        {'@type':'BreadcrumbList','@id':pageUrl+'#breadcrumb','itemListElement':[
          {'@type':'ListItem','position':1,'name':'Home','item':'https://sacramentobatteryincentive.com/'},
          {'@type':'ListItem','position':2,'name':title,'item':pageUrl}
        ]}
      ]
    };
    var script=document.createElement('script');
    script.type='application/ld+json';
    script.text=JSON.stringify(data);
    document.head.appendChild(script);
  }
  function addDescriptiveLinkLabels(){
    document.querySelectorAll('a').forEach(function(a){
      var text=cleanText(a.textContent).toLowerCase();
      if(text!=='read more'&&text!=='learn more')return;
      var scope=a.closest('article,.card,li,section,div');
      var heading=scope&&scope.querySelector('h1,h2,h3,h4');
      var headingText=cleanText(heading&&heading.textContent);
      if(headingText)a.setAttribute('aria-label',cleanText(a.textContent)+' about '+headingText);
    });
  }
  var msg=(new URLSearchParams(location.search).get('message')||document.body.dataset.message||'organic').toLowerCase();
  window.sbiVariant=msg.replace(/[^a-z0-9_]+/g,'_').slice(0,48)||'organic';
  window.sbiPageSlug=document.body.dataset.page||'';
  addStructuredData();
  addDescriptiveLinkLabels();
  (function(w,d,s,u){if(w.oaiq)return;var q=function(){q.q.push(arguments)};q.q=[];w.oaiq=q;var j=d.createElement(s);j.async=1;j.src=u;var f=d.getElementsByTagName(s)[0];f.parentNode.insertBefore(j,f)})(window,document,'script','https://bzrcdn.openai.com/sdk/oaiq.min.js');
  if(window.oaiq){oaiq('init',{pixelId:'RxXCMNBMFuUL7hstTXrvD9',debug:false});oaiq('measure','page_viewed',{type:'contents',contents:[{id:'smud_seo_'+safe(window.sbiPageSlug)+'_'+window.sbiVariant,name:document.title+' - '+window.sbiVariant,content_type:'page'}]},{event_id:eid('seo_page_viewed_'+safe(window.sbiPageSlug)+'_'+window.sbiVariant)})}
  (function(){
    var pixelId=window.SBI_META_PIXEL_ID||'897444143385193';
    window.sbiMetaPixelId=pixelId;
    window.sbiMetaEventId=function(p){return eid(p)};
    if(!pixelId||pixelId==='META_PIXEL_ID')return;
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
    fbq('init',pixelId);
    fbq('track','PageView');
    fbq('track','ViewContent',{content_category:'SMUD battery SEO',content_name:document.title,variant:window.sbiVariant,page_slug:window.sbiPageSlug},{eventID:eid('meta_viewcontent_'+safe(window.sbiPageSlug))});
  })();
  function track(n,s){
    if(window.fbq&&window.sbiMetaPixelId!=='META_PIXEL_ID'){
      var p={content_category:'SMUD battery SEO',content_name:document.title,source:s||'unknown',variant:window.sbiVariant,page_slug:window.sbiPageSlug};
      if(n==='calendar_booking_clicked')fbq('trackCustom','BookingIntent',p,{eventID:eid('meta_'+n+'_'+safe(s))});
      else if(n==='phone_call_clicked')fbq('track','Contact',p,{eventID:eid('meta_'+n+'_'+safe(s))});
      else fbq('trackCustom',n,p,{eventID:eid('meta_'+n+'_'+safe(s))});
    }
    if(window.oaiq)oaiq('measure','custom',{type:'custom'},{custom_event_name:n,event_id:eid(n+'_'+safe(s))});
  }
  document.querySelectorAll('.js-booking-link').forEach(function(a){a.href=campaignUrl('/book.html',a.dataset.track||'seo_booking_link');a.addEventListener('click',function(){track('calendar_booking_clicked',a.dataset.track||'seo_booking_link')})});
  document.querySelectorAll('.js-quick-check-link').forEach(function(a){a.href=campaignUrl('/quick-check.html',a.dataset.track||'seo_quick_check_link');a.addEventListener('click',function(){track('quick_check_clicked',a.dataset.track||'seo_quick_check_link')})});
  document.querySelectorAll('.js-phone-link').forEach(function(a){a.addEventListener('click',function(){track('phone_call_clicked',a.dataset.track||'phone_link')})});
})();
