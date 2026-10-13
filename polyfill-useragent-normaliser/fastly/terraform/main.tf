provider "fastly" {
  version = "0.1.2"
}

resource "fastly_service_v1" "app" {
  name = "polyfill-useragent-normaliser"

  force_destroy = false

  domain {
    name = "test.in.ft.com"
  }

  backend {
    name                  = "fake backend"
    address               = "127.0.0.1"
    port                  = 80
    auto_loadbalance      = false
  }

  vcl {
    name    = "main.vcl"
    content = "${file("${path.module}/../vcl/main.vcl")}"
    main    = true
  }

  vcl {
    name    = "normalise-user-agent.vcl"
    content = "${file("${path.module}/../../lib/normalise-user-agent.vcl")}"
  }
}