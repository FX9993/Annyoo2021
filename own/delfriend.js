// root
// 跳转京东好有页面
const $ = new Env("删除好友");
app.startActivity({
    packageName: "com.jingdong.app.mall", 
    className: "com.jd.lib.jdfriend.view.activity.FriendListActivity", 
    root: true
});

for(var i = 0; i < 200; i++){
    //获取这个控件
    className("android.view.ViewGroup").depth(9).findOne().click()

    sleep(500);

    let manage = desc("管理").depth(12).findOne()

    click(manage.bounds().centerX(), manage.bounds().centerY());

    className("android.widget.Button").depth(4).findOne().click()

    className("android.widget.Button").depth(5).id("bq").text("删除").findOne().click()

    back()
    
    sleep(2000);
}
