(function() {
  var canvas, ctx, W, H, particles, animId;
  var COUNT = 90;
  var CONNECT = 130;
  var AR = 180, AG = 255, AB = 0;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function makeParticle() {
    var angle = Math.random() * Math.PI * 2;
    var spd   = 0.1 + Math.random() * 0.22;
    return {
      x:  Math.random() * W,
      y:  Math.random() * H,
      vx: Math.cos(angle) * spd,
      vy: Math.sin(angle) * spd,
      r:  0.6 + Math.random() * 1.8,
      op: 0.08 + Math.random() * 0.28
    };
  }

  function initParticles() {
    particles = [];
    for (var i = 0; i < COUNT; i++) {
      particles.push(makeParticle());
    }
  }

  function drawFrame() {
    ctx.clearRect(0, 0, W, H);

    for (var i = 0; i < particles.length - 1; i++) {
      for (var j = i + 1; j < particles.length; j++) {
        var dx = particles[i].x - particles[j].x;
        var dy = particles[i].y - particles[j].y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > CONNECT) continue;
        var al = (1 - dist / CONNECT) * 0.07;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = 'rgba(' + AR + ',' + AG + ',' + AB + ',' + al + ')';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }

    for (var k = 0; k < particles.length; k++) {
      var p = particles[k];
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -10) p.x = W + 10;
      if (p.x > W + 10) p.x = -10;
      if (p.y < -10) p.y = H + 10;
      if (p.y > H + 10) p.y = -10;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + AR + ',' + AG + ',' + AB + ',' + p.op + ')';
      ctx.fill();
    }

    animId = requestAnimationFrame(drawFrame);
  }

  function init() {
    canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    resize();
    initParticles();
    drawFrame();
    window.addEventListener('resize', function() {
      resize();
      initParticles();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
