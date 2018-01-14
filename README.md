# ~chat-example~ drunkig

<img src="https://github.com/abejfehr/drunking/blob/master/1.jpg?raw=true" width="600px">

<img src="https://github.com/abejfehr/drunking/blob/master/2.jpg?raw=true" width="600px">

This is hwat happjens when you find an alcohl sensor at the electrnics stoer about a wek before St. Patty's day.

~This is the source code for a very simple chat example used for the [Getting Started](http://socket.io/get-started/chat/) guide of the Socket.IO website.~

~Please refer to it to learn how to run this application.~

~You can also spin up a free Heroku dyno to test it out:~

~Besides, the application is deployed on [Now](https://zeit.co/now): https://socketio-chat-example.now.sh/~

Aftermath..

<img src="https://github.com/abejfehr/drunking/blob/master/3.jpg?raw=true" width="600px">

# Sober Notes

Drunkig was created out of stumbling upon an alcohol sensor at a local shop. The sensor was read from an Arduino, which passed readings over Serial USB to a local nodejs server, that further sent information via sockets to a local HTML page. The result was an inaccurate but fun drinking game.

The blue portable fan seen in the first picture was used to remove the alcohol from the air around the sensor to allow faster calibration. The Arduino would do its best to assume, on button press, that the atmosphere was pre-blow. By doing some small calculations to the alcohol content increase on blow, it allowed us to display the value via LEDs ala a <a href="https://i.imgur.com/KoirUoM.png" target="_blank">love test machine</a> and record the "score" on the correct person on the graph.
