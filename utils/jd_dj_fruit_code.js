//v8.5.1
let thiscookie = '',
    deviceid = '',
    sid = '',
    nickname = '';
let lat = '30.' + Math.round(Math.random() * (99999 - 10000) + 10000);
let lng = '114.' + Math.round(Math.random() * (99999 - 10000) + 10000);
let cityid = Math.round(Math.random() * (1500 - 1000) + 1000);
let cookies = [],
    notify = '';
waterNum = 0, waterTimes = 0, shareCode = '', hzstr = '', msgStr = '';
!(async() => {
    if (cookies.length == 0) {
        if ($.env.isNode) {
            if (process.env.JDDJ_CKPATH) ckPath = process.env.JDDJ_CKPATH;
            delete require.cache[ckPath];
            let jdcookies = require(ckPath);
            for (let key in jdcookies)
                if (!!jdcookies[key]) cookies.push(jdcookies[key])
        } else {
            let ckstr = $.read('#jddj_cookies');
            if (!!ckstr) {
                if (ckstr.indexOf(',') < 0) cookies.push(ckstr);
                else cookies = ckstr.split(',')
            }
        }
    }
    if (cookies.length == 0) {
        console.log('\r\n请先填写cookie');
        return
    }
    if (!$.env.isNode) isNotify = $.read('#jddj_isNotify');
    else notify = require('./sendNotify');
    let accountNum = cookies.length;
    for (let i = 0; i < accountNum; i++) {
        console.log('\r\n★★★★★开始执行第' + (i + 1) + '个账号,共' + cookies.length + '个账号★★★★★');
        thiscookie = cookies[i];
        if (!thiscookie) continue;
        waterNum = 0, waterTimes = 0;
        thiscookie = thiscookie.replace(/ /g, '').replace(/\n/g, '');
        deviceid = _uuid();
        thiscookie = await taskLoginUrl(deviceid, thiscookie);
        await userinfo();
        await $.wait(1000);
        await treeInfo(0);
        await $.wait(1000);
        let tslist = await taskList();
        if (tslist.code == 1) {
            $.notify('第' + (i + 1) + '个账号cookie过期', '请访问\nhttps://bean.m.jd.com/bean/signIndex.action\n抓取cookie', {
                url: 'https://bean.m.jd.com/bean/signIndex.action'
            });
            if ($.env.isNode && '' + isNotify + '' == 'true') {}
            continue
        }
        await waterBottle();
        await $.wait(1000);
        await runTask(tslist);
        await $.wait(1000);
        await zhuLi();
        await $.wait(1000);
        await water();
        await $.wait(1000);
        hzstr = '';
        tslist = await taskList();
        for (let index = 0; index < tslist.result.taskInfoList.length; index++) {
            let element = tslist.result.taskInfoList[index];
            if (element.taskId == '23eee1c043c01bc') {
                shareCode += '@' + element.uniqueId + ',';
                hzstr = ',助力' + element.finishNum + '/' + element.totalNum + ',助力你的好友:';
                if (element.fissionUserInfoList && element.fissionUserInfoList.length > 0) {
                    element.fissionUserInfoList.forEach(item => {
                        hzstr += item.nickName + ','
                    });
                    hzstr = hzstr.substr(0, hzstr.length - 1)
                }
                break
            }
        }
        await treeInfo(2);
        await $.wait(1000)
    }
    console.log('京东到家果园互助码:' + shareCode);
    if ((new Date().getUTCHours() + 8) % 24 < 8) {
        $.notify('京东到家果园互助码:', '', shareCode);
        if ($.env.isNode) {
            notify.sendNotify('京东到家果园互助码:', shareCode)
        }
    }
    if ($.env.isNode) await notify.sendNotify('京东到家果园信息', msgStr);
    if (process.env.SCF_NAMESPACE) $.write(shareCode, 'shareCodes')
})().catch(async(e) => {
    console.log('', '❌失败! 原因:' + e + '!', '');
    if ($.env.isNode && '' + isNotify + '' == 'true') {
        notify.sendNotify('京东到家果园', '❌失败! 原因:' + e + '!')
    }
}).finally(() => {
    $.done()
});
async
function userinfo() {
    return new Promise(async resolve => {
        try {
            let option = urlTask('https://daojia.jd.com/client?_jdrandom=' + Math.round(new Date()) + '&platCode=H5&appName=paidaojia&channel=&appVersion=8.7.6&jdDevice=&functionId=mine%2FgetUserAccountInfo&body=%7B%22refPageSource%22:%22%22,%22fromSource%22:2,%22pageSource%22:%22myinfo%22,%22ref%22:%22%22,%22ctp%22:%22myinfo%22%7D&jda=&traceId=' + deviceid + Math.round(new Date()) + '&deviceToken=' + deviceid + '&deviceId=' + deviceid, '');
            $.http.get(option).then(response => {
                let data = JSON.parse(response.body);
                if (data.code == 0) {
                    try {
                        nickname = data.result.userInfo.userBaseInfo.nickName;
                        console.log("●●●" + nickname + "●●●")
                    } catch (error) {
                        nickname = '昵称获取失败'
                    }
                }
            });
            resolve()
        } catch (error) {
            console.log('\n【个人信息】:' + error);
            resolve()
        }
    })
}
async
function taskList() {
    return new Promise(async resolve => {
        try {
            let option = urlTask('https://daojia.jd.com/client?_jdrandom=' + Math.round(new Date()) + '&functionId=task%2Flist&isNeedDealError=true&body=%7B%22modelId%22%3A%22M10007%22%2C%22plateCode%22%3A1%7D&channel=ios&platform=6.6.0&platCode=h5&appVersion=6.6.0&appName=paidaojia&deviceModel=appmodel&traceId=' + deviceid + '&deviceToken=' + deviceid + '&deviceId=' + deviceid, '');
            $.http.get(option).then(response => {
                let data = JSON.parse(response.body);
                resolve(data)
            })
        } catch (error) {
            console.log('\n【任务列表】:' + error);
            resolve({})
        }
    })
}
async
function water() {
    return new Promise(async resolve => {
        try {
            let option = urlTask('https://daojia.jd.com/client?_jdrandom=' + Math.round(new Date()), 'functionId=fruit%2Fwatering&isNeedDealError=true&method=POST&body=%7B%22waterTime%22%3A1%7D&channel=ios&platform=6.6.0&platCode=h5&appVersion=6.6.0&appName=paidaojia&deviceModel=appmodel&traceId=' + deviceid + '&deviceToken=' + deviceid + '&deviceId=' + deviceid);
            let waterStatus = 1,
                waterCount = 0;
            do {
                waterCount++;
                console.log('\n**********开始执行第' + waterCount + '次浇水**********');
                await $.http.post(option).then(response => {
                    let data = JSON.parse(response.body);
                    console.log('\n【浇水】:' + data.msg);
                    waterStatus = data.code;
                    if (data.code == 0) waterTimes++
                });
                await $.wait(1000)
            } while (waterStatus == 0);
            resolve()
        } catch (error) {
            console.log('\n【浇水】:' + error);
            resolve()
        }
    })
}
async
function sign() {
    return new Promise(async resolve => {
        try {
            let option = urlTask('https://daojia.jd.com/client?_jdrandom=' + Math.round(new Date()) + '&functionId=signin%2FuserSigninNew&isNeedDealError=true&body=%7B%22channel%22%3A%22daojiaguoyuan%22%2C%22cityId%22%3A' + cityid + '%2C%22longitude%22%3A' + lng + '%2C%22latitude%22%3A' + lat + '%2C%22ifCic%22%3A0%7D&channel=ios&platform=6.6.0&platCode=h5&appVersion=6.6.0&appName=paidaojia&deviceModel=appmodel&traceId=' + deviceid + '&deviceToken=' + deviceid + '&deviceId=' + deviceid, '');
            $.http.get(option).then(response => {
                let data = JSON.parse(response.body);
                console.log('\n【到家签到】:' + data.msg);
                resolve()
            })
        } catch (error) {
            console.log('\n【到家签到领水滴】:' + error);
            resolve()
        }
    })
}
async
function waterBottle() {
    return new Promise(async resolve => {
        try {
            let receiveStatus;
            let option = urlTask('https://daojia.jd.com/client?_jdrandom=' + Math.round(new Date()) + '&functionId=fruit%2FgetWaterBottleInfo&isNeedDealError=true&body=%7B%7D&channel=ios&platform=6.6.0&platCode=h5&appVersion=6.6.0&appName=paidaojia&deviceModel=appmodel&traceId=' + deviceid + Math.round(new Date()) + '&deviceToken=' + deviceid + '&deviceId=' + deviceid, '');
            await $.http.get(option).then(response => {
                const data = JSON.parse(response.body);
                if (data.code == 0) {
                    receiveStatus = data.result.receiveStatus;
                    console.log('\n【收玻璃瓶水滴】:水瓶中有:' + data.result.yesterdayAccumulate + '水滴')
                } else {
                    console.log('\n【收玻璃瓶水滴】:水瓶信息错误')
                }
            });
            if (receiveStatus == 0) {
                option = urlTask('https://daojia.jd.com/client?_jdrandom=' + Math.round(new Date()) + '&functionId=fruit%2FreceiveWaterBottle&isNeedDealError=true&body=%7B%7D&channel=ios&platform=6.6.0&platCode=h5&appVersion=6.6.0&appName=paidaojia&deviceModel=appmodel&traceId=' + deviceid + Math.round(new Date()) + '&deviceToken=' + deviceid + '&deviceId=' + deviceid, '');
                await $.http.get(option).then(response => {
                    const data = JSON.parse(response.body);
                    if (data.code == 0) {
                        console.log('\n【收玻璃瓶水滴】:水瓶收取成功')
                    } else {
                        console.log('\n【收玻璃瓶水滴】:水瓶收取错误')
                    }
                })
            } else if (receiveStatus == 1) {
                console.log('\n【收玻璃瓶水滴】:水瓶已经收取过')
            } else if (receiveStatus == -2) {
                console.log('\n【收玻璃瓶水滴】:收取时间未到')
            } else {
                console.log('\n【收玻璃瓶水滴】:水瓶状态错误或暂不可收取:')
            }
            resolve()
        } catch (error) {
            console.log('\n【收玻璃瓶水滴】:' + error);
            resolve()
        }
    })
}
async
function zhuLi() {
    return new Promise(async resolve => {
        try {
            let scodes = [],
                codestr = '';
            if (new Date().getHours() < 8) {
                await $.http.get({
                    url: 'https://gitee.com/passerby-b/javascript/raw/master/test/sharecode.js'
                }).then(response => {
                    codestr = response.body
                });
                if ($.read('shareCodes')) codestr += $.read('shareCodes')
            }
            try {
                await $.http.get({
                    url: 'http://51.15.187.136:8080/queryJddjCode',
                    timeout: 20000
                }).then(response => {
                    codestr += response.body
                })
            } catch (error) {}
            codestr = codestr.replace(/ /g, '').replace(/\n/g, '');
            if (!!codestr) {
                codestr = codestr.substr(0, codestr.length - 1);
                scodes = codestr.split(',')
            }
            for (let index = 0; index < scodes.length; index++) {
                let option = urlTask('https://daojia.jd.com/client?lat=' + lat + '&lng=' + lng + '&lat_pos=' + lat + '&lng_pos=' + lng + '&city_id=' + cityid + '&deviceToken=' + deviceid + '&deviceId=' + deviceid + '&channel=wx_xcx&mpChannel=wx_xcx&platform=5.0.0&platCode=mini&appVersion=5.0.0&appName=paidaojia&deviceModel=appmodel&xcxVersion=9.2.0&isNeedDealError=true&business=djgyzhuli&functionId=task%2Ffinished&body=%7B%22modelId%22%3A%22M10007%22%2C%22taskType%22%3A1201%2C%22taskId%22%3A%2223eee1c043c01bc%22%2C%22plateCode%22%3A5%2C%22assistTargetPin%22%3A%22' + scodes[index].split('@')[0] + '%22%2C%22uniqueId%22%3A%22' + scodes[index].split('@')[1] + '%22%7D', '');
                await $.http.get(option).then(response => {
                    let data = JSON.parse(response.body);
                    console.log('\n【助力】:' + data.msg)
                });
                await $.wait(1000)
            }
            resolve()
        } catch (error) {
            console.log('\n【助力】:' + error);
            resolve()
        }
    })
}
async
function _runTask(tslist) {
    return new Promise(async resolve => {
        try {
            for (let index = 0; index < tslist.result.taskInfoList.length; index++) {
                const item = tslist.result.taskInfoList[index];
                if (item.taskType == 307 || item.taskType == 901) {
                    let option = urlTask('https://daojia.jd.com/client?_jdrandom=' + Math.round(new Date()) + '&functionId=task%2Freceived&isNeedDealError=true&body=%7B%22modelId%22%3A%22' + item.modelId + '%22%2C%22taskId%22%3A%22' + encodeURIComponent(item.taskId) + '%22%2C%22taskType%22%3A' + item.taskType + '%2C%22plateCode%22%3A1%2C%22subNode%22%3Anull%7D&channel=ios&platform=6.6.0&platCode=h5&appVersion=6.6.0&appName=paidaojia&deviceModel=appmodel&traceId=' + deviceid + Math.round(new Date()) + '&deviceToken=' + deviceid + '&deviceId=' + deviceid, '');
                    await $.http.get(option).then(response => {
                        var data = JSON.parse(response.body),
                            msg = '';
                        if (data.code == 0) {
                            msg = data.msg + ',奖励:' + data.result.awardValue
                        } else {
                            msg = data.msg
                        }
                        console.log('\n领取任务【' + item.taskTitle + '】:' + msg)
                    })
                }
                if (item.browseTime > -1) {
                    for (let t = 0; t < parseInt(item.browseTime); t++) {
                        await $.wait(1000);
                        console.log('计时:' + (t + 1) + '秒...')
                    }
                };
                option = urlTask('https://daojia.jd.com/client?_jdrandom=' + Math.round(new Date()) + '&functionId=task%2Ffinished&isNeedDealError=true&body=%7B%22modelId%22%3A%22' + item.modelId + '%22%2C%22taskId%22%3A%22' + encodeURIComponent(item.taskId) + '%22%2C%22taskType%22%3A' + item.taskType + '%2C%22plateCode%22%3A1%2C%22subNode%22%3Anull%7D&channel=ios&platform=6.6.0&platCode=h5&appVersion=6.6.0&appName=paidaojia&deviceModel=appmodel&traceId=' + deviceid + Math.round(new Date()) + '&deviceToken=' + deviceid + '&deviceId=' + deviceid, '');
                await $.http.get(option).then(response => {
                    var data = JSON.parse(response.body),
                        msg = '';
                    if (data.code == 0) {
                        msg = data.msg + ',奖励:' + data.result.awardValue
                    } else {
                        msg = data.msg
                    }
                    console.log('\n任务完成【' + item.taskTitle + '】:' + msg)
                });
                option = urlTask('https://daojia.jd.com/client?_jdrandom=' + Math.round(new Date()) + '&functionId=task%2FsendPrize&isNeedDealError=true&body=%7B%22modelId%22%3A%22' + item.modelId + '%22%2C%22taskId%22%3A%22' + encodeURIComponent(item.taskId) + '%22%2C%22taskType%22%3A' + item.taskType + '%2C%22plateCode%22%3A1%2C%22subNode%22%3Anull%7D&channel=ios&platform=6.6.0&platCode=h5&appVersion=6.6.0&appName=paidaojia&deviceModel=appmodel&traceId=' + deviceid + Math.round(new Date()) + '&deviceToken=' + deviceid + '&deviceId=' + deviceid, '');
                await $.http.get(option).then(response => {
                    var data = JSON.parse(response.body),
                        msg = '';
                    if (data.code == 0) {
                        msg = data.msg + ',奖励:' + data.result.awardValue
                    } else {
                        msg = data.msg
                    }
                    console.log('\n领取奖励【' + item.taskTitle + '】:' + msg)
                })
            }
            resolve()
        } catch (error) {
            console.log('\n【执行任务】:' + error);
            resolve()
        }
    })
}
const do_tasks = [307, 901, 1102, 1105, 1103, 0, 1101];
async
function runTask(tslist) {
    return new Promise(async resolve => {
        try {
            for (let index = 0; index < tslist.result.taskInfoList.length; index++) {
                const item = tslist.result.taskInfoList[index];
                if (item.status == 3 || item.status == 2) {
                    console.log('\n【' + item.taskTitle + '】: 任务已完成,跳过做任务')
                } else if (item.taskType == 502) {
                    await sign()
                } else if (do_tasks.includes(item.taskType)) {
                    if (item.status == 0) {
                        let option = urlTask('https://daojia.jd.com/client?_jdrandom=' + Math.round(new Date()) + '&functionId=task%2Freceived&isNeedDealError=true&body=%7B%22modelId%22%3A%22' + item.modelId + '%22%2C%22taskId%22%3A%22' + encodeURIComponent(item.taskId) + '%22%2C%22taskType%22%3A' + item.taskType + '%2C%22plateCode%22%3A1%2C%22subNode%22%3Anull%7D&channel=ios&platform=6.6.0&platCode=h5&appVersion=6.6.0&appName=paidaojia&deviceModel=appmodel&traceId=' + deviceid + Math.round(new Date()) + '&deviceToken=' + deviceid + '&deviceId=' + deviceid, '');
                        await $.http.get(option).then(response => {
                            let data = JSON.parse(response.body),
                                msg = '';
                            if (data.code == 0) {
                                msg = data.msg + ',奖励:' + data.result.awardValue
                            } else {
                                msg = data.msg
                            }
                            console.log('\n领取任务【' + item.taskTitle + '】:' + msg)
                        });
                        if (item.browseTime > -1) {
                            for (let t = 0; t < parseInt(item.browseTime); t++) {
                                await $.wait(1000);
                                console.log('计时:' + (t + 1) + '秒...')
                            }
                        }
                    } else {
                        console.log('\n【' + item.taskTitle + '】: 任务已领取或不需要领取')
                    }; if (item.taskType != 0) {
                        option = urlTask('https://daojia.jd.com/client?_jdrandom=' + Math.round(new Date()) + '&functionId=task%2Ffinished&isNeedDealError=true&body=%7B%22modelId%22%3A%22' + item.modelId + '%22%2C%22taskId%22%3A%22' + encodeURIComponent(item.taskId) + '%22%2C%22taskType%22%3A' + item.taskType + '%2C%22plateCode%22%3A1%2C%22subNode%22%3Anull%7D&channel=ios&platform=6.6.0&platCode=h5&appVersion=6.6.0&appName=paidaojia&deviceModel=appmodel&traceId=' + deviceid + Math.round(new Date()) + '&deviceToken=' + deviceid + '&deviceId=' + deviceid, '');
                        await $.http.get(option).then(response => {
                            let data = JSON.parse(response.body),
                                msg = '';
                            if (data.code == 0) {
                                msg = data.msg + ',奖励:' + data.result.awardValue;
                                item.status = 2
                            } else {
                                msg = data.msg
                            }
                            console.log('\n任务完成【' + item.taskTitle + '】:' + msg)
                        })
                    }
                } else {
                    console.log('\n【' + item.taskTitle + '】: 脚本无法执行此任务或任务不需要主动完成')
                } if (item.status == 2 || item.taskTypes == 1102) {
                    option = urlTask('https://daojia.jd.com/client?_jdrandom=' + Math.round(new Date()) + '&functionId=task%2FsendPrize&isNeedDealError=true&body=%7B%22modelId%22%3A%22' + item.modelId + '%22%2C%22taskId%22%3A%22' + encodeURIComponent(item.taskId) + '%22%2C%22taskType%22%3A' + item.taskType + '%2C%22plateCode%22%3A1%2C%22subNode%22%3Anull%7D&channel=ios&platform=6.6.0&platCode=h5&appVersion=6.6.0&appName=paidaojia&deviceModel=appmodel&traceId=' + deviceid + Math.round(new Date()) + '&deviceToken=' + deviceid + '&deviceId=' + deviceid, '');
                    await $.http.get(option).then(response => {
                        let data = JSON.parse(response.body),
                            msg = '';
                        if (data.code == 0) {
                            msg = data.msg + ',奖励:' + data.result.awardValue
                        } else {
                            msg = data.msg
                        }
                        console.log('\n领取奖励【' + item.taskTitle + '】:' + msg)
                    })
                } else if (item.status == 3) {
                    console.log('\n【' + item.taskTitle + '】: 奖励已领取,跳过领奖励')
                } else {
                    console.log('\n【' + item.taskTitle + '】: 任务未完成,跳过领奖励')
                }
            }
            resolve()
        } catch (error) {
            console.log('\n【执行任务】:' + error);
            resolve()
        }
    })
}
async
function runTask2(tslist) {
    return new Promise(async resolve => {
        try {
            for (let index = 0; index < tslist.result.taskInfoList.length; index++) {
                const item = tslist.result.taskInfoList[index];
                if (item.taskTitle.indexOf('限时') > -1) {
                    let option = urlTask('https://daojia.jd.com/client?_jdrandom=' + Math.round(new Date()) + '&functionId=task%2Freceived&isNeedDealError=true&body=%7B%22modelId%22%3A%22' + item.modelId + '%22%2C%22taskId%22%3A%22' + encodeURIComponent(item.taskId) + '%22%2C%22taskType%22%3A' + item.taskType + '%2C%22plateCode%22%3A1%2C%22subNode%22%3Anull%7D&channel=ios&platform=6.6.0&platCode=h5&appVersion=6.6.0&appName=paidaojia&deviceModel=appmodel&traceId=' + deviceid + Math.round(new Date()) + '&deviceToken=' + deviceid + '&deviceId=' + deviceid, '');
                    await $.http.get(option).then(response => {
                        var data = JSON.parse(response.body),
                            msg = '';
                        if (data.code == 0) {
                            msg = data.msg + ',奖励:' + data.result.awardValue
                        } else {
                            msg = data.msg
                        }
                        console.log('\n领取任务【' + item.taskTitle + '】:' + msg)
                    });
                    if (item.browseTime > -1) {
                        for (let t = 0; t < parseInt(item.browseTime); t++) {
                            await $.wait(1000);
                            console.log('计时:' + (t + 1) + '秒...')
                        }
                    };
                    option = urlTask('https://daojia.jd.com/client?_jdrandom=' + Math.round(new Date()) + '&functionId=task%2Ffinished&isNeedDealError=true&body=%7B%22modelId%22%3A%22' + item.modelId + '%22%2C%22taskId%22%3A%22' + encodeURIComponent(item.taskId) + '%22%2C%22taskType%22%3A' + item.taskType + '%2C%22plateCode%22%3A1%2C%22subNode%22%3Anull%7D&channel=ios&platform=6.6.0&platCode=h5&appVersion=6.6.0&appName=paidaojia&deviceModel=appmodel&traceId=' + deviceid + Math.round(new Date()) + '&deviceToken=' + deviceid + '&deviceId=' + deviceid, '');
                    await $.http.get(option).then(response => {
                        var data = JSON.parse(response.body),
                            msg = '';
                        if (data.code == 0) {
                            msg = data.msg + ',奖励:' + data.result.awardValue
                        } else {
                            msg = data.msg
                        }
                        console.log('\n任务完成【' + item.taskTitle + '】:' + msg)
                    });
                    option = urlTask('https://daojia.jd.com/client?_jdrandom=' + Math.round(new Date()) + '&functionId=task%2FsendPrize&isNeedDealError=true&body=%7B%22modelId%22%3A%22' + item.modelId + '%22%2C%22taskId%22%3A%22' + encodeURIComponent(item.taskId) + '%22%2C%22taskType%22%3A' + item.taskType + '%2C%22plateCode%22%3A1%2C%22subNode%22%3Anull%7D&channel=ios&platform=6.6.0&platCode=h5&appVersion=6.6.0&appName=paidaojia&deviceModel=appmodel&traceId=' + deviceid + Math.round(new Date()) + '&deviceToken=' + deviceid + '&deviceId=' + deviceid, '');
                    await $.http.get(option).then(response => {
                        var data = JSON.parse(response.body),
                            msg = '';
                        if (data.code == 0) {
                            msg = data.msg + ',奖励:' + data.result.awardValue
                        } else {
                            msg = data.msg
                        }
                        console.log('\n领取奖励【' + item.taskTitle + '】:' + msg)
                    })
                }
            }
            resolve()
        } catch (error) {
            console.log('\n【执行任务】:' + error);
            resolve()
        }
    })
}
async
function treeInfo(step) {
    return new Promise(async resolve => {
        try {
            let option = urlTask('https://daojia.jd.com/client', 'lat=' + lat + '&lng=' + lng + '&lat_pos=' + lat + '&lng_pos=' + lng + '&city_id=' + cityid + '&deviceToken=' + deviceid + '&deviceId=' + deviceid + '&channel=wx_xcx&mpChannel=wx_xcx&platform=5.0.0&platCode=mini&appVersion=5.0.0&appName=paidaojia&deviceModel=appmodel&xcxVersion=8.10.1&isNeedDealError=true&business=wxshouyeqiu&functionId=fruit%2FinitFruit&method=POST&body=%7B%22cityId%22%3A' + cityid + '%2C%22longitude%22%3A' + lng + '%2C%22latitude%22%3A' + lat + '%7D');
            await $.http.post(option).then(async response => {
                let data = JSON.parse(response.body);
                if (data.code == 0) {
                    if (step == 0) {
                        waterNum = data.result.userResponse.waterBalance;
                        shareCode += data.result.activityInfoResponse.userPin
                    }
                    if (step == 2) {
                        waterNum = (waterTimes * 10) + data.result.userResponse.waterBalance - waterNum;
                        if (waterNum < 0) waterNum = 0;
                        if (data.result.activityInfoResponse.curStageLeftProcess == 0) {
                            console.log('\n京东到家果园【' + nickname + '】:' + data.result.activityInfoResponse.fruitName + '已成熟,快去收取!');
                            $.notify('京东到家果园', '【' + nickname + '】', '京东到家果园' + data.result.activityInfoResponse.fruitName + '已成熟,快去收取!\r\n (入口：京东APP首页-京东到家-我的-签到有惊喜-免费领水果)');
                            if ($.env.isNode && '' + isNotify + '' == 'true') {
                                msgStr += '\r\n【' + nickname + '】\r\n京东到家果园' + data.result.activityInfoResponse.fruitName + '已成熟,快去收取!\r\n (入口：京东APP首页-京东到家-我的-签到有惊喜-免费领水果)'
                            }
                        }
                        if (data.result.activityInfoResponse.curStageLeftProcess > 0) {
                            let unit = '次';
                            if (data.result.activityInfoResponse.growingStage == 5) unit = '%';
                            console.log('\n京东到家果园【' + nickname + '】:' + data.result.activityInfoResponse.fruitName + ',本次领取' + waterNum + '滴水,浇水' + waterTimes + '次,还需浇水' + data.result.activityInfoResponse.curStageLeftProcess + unit + data.result.activityInfoResponse.stageName + ',还剩' + data.result.userResponse.waterBalance + '滴水' + hzstr);
                            $.notify('京东到家果园', '【' + nickname + '】', '【果树信息】:' + data.result.activityInfoResponse.fruitName + ',本次领取' + waterNum + '滴水,浇水' + waterTimes + '次,还需浇水' + data.result.activityInfoResponse.curStageLeftProcess + unit + data.result.activityInfoResponse.stageName + ',还剩' + data.result.userResponse.waterBalance + '滴水' + hzstr);
                            if ($.env.isNode && '' + isNotify + '' == 'true') {
                                msgStr += '\r\n【' + nickname + '】\r\n【果树信息】:' + data.result.activityInfoResponse.fruitName + ',本次领取' + waterNum + '滴水,浇水' + waterTimes + '次,还需浇水' + data.result.activityInfoResponse.curStageLeftProcess + unit + data.result.activityInfoResponse.stageName + ',还剩' + data.result.userResponse.waterBalance + '滴水' + hzstr
                            }
                        }
                    }
                }
                resolve()
            })
        } catch (error) {
            console.log('\n【果树信息】:' + error);
            resolve()
        } finally {
            treeInfoTimes = true
        }
    })
}

function urlTask(url, body) {
    let option = {
        url: url,
        headers: {
            'Host': 'daojia.jd.com',
            'Content-Type': 'application/x-www-form-urlencoded;',
            'Origin': 'https://daojia.jd.com',
            'Cookie': thiscookie,
            'Connection': 'keep-alive',
            'Accept': '*/*',
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148________appName=jdLocal&platform=iOS&commonParams={"sharePackageVersion":"2"}&djAppVersion=8.7.5&supportDJSHWK',
            'Accept-Language': 'zh-cn'
        },
        body: body
    };
    return option
}
async
function taskLoginUrl(deviceid, thiscookie) {
    return new Promise(async resolve => {
        try {
            let option = {
                url: encodeURI('https://daojia.jd.com/client?_jdrandom=' + (+new Date()) + '&_funid_=login/treasure&functionId=login/treasure&body={}&lat=&lng=&lat_pos=&lng_pos=&city_id=&channel=h5&platform=6.6.0&platCode=h5&appVersion=6.6.0&appName=paidaojia&deviceModel=appmodel&isNeedDealError=false&traceId=' + deviceid + '&deviceToken=' + deviceid + '&deviceId=' + deviceid + '&_jdrandom=' + (+new Date()) + '&_funid_=login/treasure'),
                headers: {
                    "Cookie": 'deviceid_pdj_jd=' + deviceid + ';' + thiscookie + ';',
                    "Host": "daojia.jd.com",
                    'Content-Type': 'application/x-www-form-urlencoded;',
                    "User-Agent": 'jdapp;iPhone;10.0.10;14.1;311fc185ed97a0392e35657dfe2a321664170965;network/wifi;model/iPhone11,6;appBuild/167764;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS 14_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1'
                }
            };
            let ckstr = '';
            await $.http.get(option).then(async response => {
                if (response.body.indexOf('请求成功') > -1) {
                    let ckArry = [];
                    if (response.headers['set-cookie']) ckArry = response.headers['set-cookie'];
                    else if (response.headers['Set-Cookie']) ckArry = response.headers['Set-Cookie'].split(';');
                    for (const o of ckArry) {
                        if (o.indexOf('o2o') > -1 || o.indexOf('H5_PIN') > -1) ckstr += o + ';'
                    }
                    ckstr += 'deviceid_pdj_jd=' + deviceid
                }
            });
            resolve(ckstr)
        } catch (error) {
            console.log(error);
            resolve('')
        }
    })
}

function _uuid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4()
}
