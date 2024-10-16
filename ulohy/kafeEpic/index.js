<script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/3.1.3/socket.io.min.js"></script>
<script>
    var socket = io();

    socket.on('coffee_notification', function(data) {
        alert(data.message);
    });
</script>
