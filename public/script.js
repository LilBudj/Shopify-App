fetch(`https://lil-proxy.herokuapp.com/api/settings?shop=${window.location}`)
    .then(res => res.json())
     .then(res => {
         renderTimer(res.data[0]);
         console.log(Date.parse(res.data.endDate.end) - Date.parse(new Date()));
     })
     .catch(error => {console.log(error)});

    const renderTimer = (data) => {
        let div = document.createElement('div');
        div.className = "alert";

        let link = document.createElement('link');
        link.id = 'lil-css';
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = 'https://lil-shopify.herokuapp.com/index.css';
        link.media = 'all';
        document.head.append(link);

        const decodeColors = (model) => {
            let {hue, saturation, brightness, alpha} = model;
            return `${hue}, ${saturation*100}%, ${brightness*100}%, ${alpha}`
        };

        let position = data.sticky?"sticky":"static";

        div.innerHTML = "<div class=\'first-sign\' style=\"font-size: 40px; font-weight: 700; display: flex; align-items: center; justify-content: center; width: 30%\">Hurry Up!</div><div class=\'inner-container\' style=\"display: flex; justify-content: center; align-items: center ;width: 40%; height: 100% \">" +
            "<div class=\"countdown-number\" style=\"display: flex; flex-direction: column; justify-content: space-between; margin-right: 12px\">\n" +
            "<div class=\'numbers-container\' style=\"display: flex; justify-content: space-between\">" +
            "    <div class='\number-place'\ style=\"border-radius: 6px; font-size: 32px; font-weight: 600; box-shadow: #0b0f27 0 0 8px;margin-left: 4px; margin-right: 4px; background-color: #fff; color: rgb(65, 65, 106); width: 35px\"><span class=\"days-countdown-time-first\">1</span></div>\n" +
            "    <div class='\number-place'\ style=\"border-radius: 6px; font-size: 32px; font-weight: 600; box-shadow: #0b0f27 0 0 8px;margin-left: 4px; margin-right: 4px; background-color: #fff; color: rgb(65, 65, 106); width: 35px\"><span class=\"days-countdown-time-second\">1</span></div>\n" +
            "</div>" +
            "    <span class=\"countdown-text\">Days</span>\n" +
            "  </div>\n" +
            "  <div class=\"countdown-number\" style=\"display: flex; flex-direction: column; justify-content: space-between\">\n" +
            "<div class=\'numbers-container\' style=\"display: flex; justify-content: space-between\">" +
            "    <div class='\number-place'\ style=\"border-radius: 6px; font-size: 32px; font-weight: 600; box-shadow: #0b0f27 0 0 8px;margin-left: 4px; margin-right: 4px; background-color: #fff; color: rgb(65, 65, 106); width: 35px\"><span class=\"hours-countdown-time-first\">2</span></div>\n" +
            "    <div class='\number-place'\ style=\"border-radius: 6px; font-size: 32px; font-weight: 600; box-shadow: #0b0f27 0 0 8px;margin-left: 4px; margin-right: 4px; background-color: #fff; color: rgb(65, 65, 106); width: 35px\"><span class=\"hours-countdown-time-second\">2</span></div>\n" +
            "</div>" +
            "    <span class=\"countdown-text\">Hours</span>\n" +
            "  </div>\n" +
            "<span style=\"font-size: 30px; position: relative;bottom: 8px; right: 6px;font-weight: 900\">:</span>" +
            "  <div class=\"countdown-number\" style=\"display: flex; flex-direction: column; justify-content: space-between\">\n" +
            "<div class=\'numbers-container\' style=\"display: flex; justify-content: space-between\">" +
            "    <div class='\number-place'\ style=\"border-radius: 6px; font-size: 32px; font-weight: 600; box-shadow: #0b0f27 0 0 8px;margin-left: 4px; margin-right: 4px; background-color: #fff; color: rgb(65, 65, 106); width: 35px\"><span class=\"minutes-countdown-time-first\">3</span></div>\n" +
            "    <div class='\number-place'\ style=\"border-radius: 6px; font-size: 32px; font-weight: 600; box-shadow: #0b0f27 0 0 8px;margin-left: 4px; margin-right: 4px; background-color: #fff; color: rgb(65, 65, 106); width: 35px\"><span class=\"minutes-countdown-time-second\">3</span></div>\n" +
            "</div>" +
            "    <span class=\"countdown-text\">Minutes</span>\n" +
            "  </div>\n" +
            "<span style=\"font-size: 30px; position: relative; bottom: 8px; right: 6px; font-weight: 900 \">:</span>" +
            "  <div class=\"countdown-number\" style=\"display: flex; flex-direction: column; justify-content: space-between\">\n" +
            "<div class=\'numbers-container\' style=\"display: flex; justify-content: space-between\">" +
            "    <div class='\number-place'\ style=\"border-radius: 6px; font-size: 32px; font-weight: 600; box-shadow: #0b0f27 0 0 8px;margin-left: 4px; margin-right: 4px; background-color: #fff; color: rgb(65, 65, 106); width: 35px\"><span class=\"seconds-countdown-time-first\">4</span></div>\n" +
            "    <div class='\number-place'\ style=\"border-radius: 6px; font-size: 32px; font-weight: 600; box-shadow: #0b0f27 0 0 8px;margin-left: 4px; margin-right: 4px; background-color: #fff; color: rgb(65, 65, 106); width: 35px\"><span class=\"seconds-countdown-time-second\">4</span></div>\n" +
            "</div>" +
            "    <span class=\"countdown-text\">Seconds</span>\n" +
            "  </div>" +
            "</div><div class=\'last-sign\'>Flash sale!</div>\n";
        div.style.cssText = `background-color: hsla(${decodeColors(data.backGroundColor)}); ` +
            "display: flex; " +
            "justify-content: " +
            "space-around;" +
            "text-align: center; " +
            "height: 100px; " +
            `border: ${data.borderSize}px solid hsla(${decodeColors(data.borderColor)});` +
            "font-size: 24px; " +
            "font-weight: 700;" +
            "color: rgb(65, 65, 106); " +
            "z-index: 12; " +
            "top: 0px; " +
            `position: ${position||"sticky"};` +
            "font-family:-apple-system, BlinkMacSystemFont, \"San Francisco\", Roboto, \"Segoe UI\", \"Helvetica Neue\", sans-serif;\n";
        div.id = 'countdown';
        (data.position !== "Bottom") ? document.body.prepend(div):document.body.append(div);

        function getTimeRemaining(endtime) {
            var t = Date.parse(endtime) - Date.parse(new Date());
            var seconds = Math.floor((t / 1000) % 60);
            var minutes = Math.floor((t / 1000 / 60) % 60);
            var hours = Math.floor((t / (1000 * 60 * 60)) % 24);
            var days = Math.floor(t / (1000 * 60 * 60 * 24));
            return {
                'total': t,
                'days': days,
                'hours': hours,
                'minutes': minutes,
                'seconds': seconds
            };
        }

        function initializeClock(id, endtime) {
            var clock = document.getElementById(id);
            var daysSpanTeens = clock.querySelector('.days-countdown-time-first');
            var hoursSpanTeens = clock.querySelector('.hours-countdown-time-first');
            var minutesSpanTeens = clock.querySelector('.minutes-countdown-time-first');
            var secondsSpanTeens = clock.querySelector('.seconds-countdown-time-first');
            var daysSpanZeroes = clock.querySelector('.days-countdown-time-second');
            var hoursSpanZeroes = clock.querySelector('.hours-countdown-time-second');
            var minutesSpanZeroes = clock.querySelector('.minutes-countdown-time-second');
            var secondsSpanZeroes = clock.querySelector('.seconds-countdown-time-second');

            function updateClock() {
                var t = getTimeRemaining(endtime);

                daysSpanTeens.innerHTML = `${Math.floor(t.days / 10)}`;
                daysSpanZeroes.innerHTML = `${t.days % 10}`;
                hoursSpanTeens.innerHTML = `${Math.floor(t.hours / 10)}`;
                hoursSpanZeroes.innerHTML = `${t.hours % 10}`;
                minutesSpanTeens.innerHTML = `${Math.floor(t.minutes / 10)}`;
                minutesSpanZeroes.innerHTML = `${t.minutes % 10}`;
                secondsSpanTeens.innerHTML = `${Math.floor(t.seconds / 10)}`;
                secondsSpanZeroes.innerHTML = `${t.seconds % 10}`;

                if (t.total <= 0) {
                    clearInterval(timeinterval);
                }
            }

            updateClock();
            var timeinterval = setInterval(updateClock, 1000);
        }

        var deadline = data.endDate.end;
        setTimeout(() => {
            initializeClock('countdown', deadline);
        }, 100);
    };