# Recursos — Kubernetes y despliegue

Mapa de documentación oficial para las fases 3 a 8 del `README.md`.
La idea no es leer todo: leer el concepto y aplicarlo a un manifiesto del lab.

---

## 1. Base

| Tema | Link |
|---|---|
| Docs oficiales en español | https://kubernetes.io/es/docs/home/ |
| Docs oficiales en inglés | https://kubernetes.io/docs/home/ |
| Referencia rápida de `kubectl` | https://kubernetes.io/docs/reference/kubectl/quick-reference/ |
| Minikube (cluster local) | https://minikube.sigs.k8s.io/docs/ |
| Minikube handbook | https://minikube.sigs.k8s.io/docs/handbook/ |

---

## 2. Por fase del README

### Fase 3 — K8s base con Minikube

| Objeto | Link |
|---|---|
| Namespace | https://kubernetes.io/es/docs/concepts/overview/working-with-objects/namespaces/ |
| Deployment | https://kubernetes.io/es/docs/concepts/workloads/controllers/deployment/ |
| Service | https://kubernetes.io/es/docs/concepts/services-networking/service/ |
| ConfigMap | https://kubernetes.io/es/docs/concepts/configuration/configmap/ |
| Secret | https://kubernetes.io/es/docs/concepts/configuration/secret/ |
| Ingress | https://kubernetes.io/es/docs/concepts/services-networking/ingress/ |
| Addons de Minikube (incluye `ingress`) | https://minikube.sigs.k8s.io/docs/handbook/addons/ |

Comando clave para el Ingress local:
```bash
minikube addons enable ingress
minikube tunnel
```

### Fase 4 — Infra interna en K8s

| Objeto | Link |
|---|---|
| StatefulSet (Postgres/Kafka) | https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/ |
| PersistentVolume | https://kubernetes.io/docs/concepts/storage/persistent-volumes/ |
| Job (migraciones y topics) | https://kubernetes.io/docs/concepts/workloads/controllers/job/ |

### Fase 5 — Estabilización

| Tema | Link |
|---|---|
| Liveness / Readiness / Startup probes | https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/ |
| Requests y limits | https://kubernetes.io/es/docs/concepts/configuration/manage-resources-containers/ |

### Fase 6 — API Gateway

| Tema | Link |
|---|---|
| Spring Cloud Gateway | https://docs.spring.io/spring-cloud-gateway/reference/ |

### Fase 7 — GitOps (CI + ArgoCD)

| Tema | Link |
|---|---|
| GitHub Actions | https://docs.github.com/en/actions |
| ArgoCD | https://argo-cd.readthedocs.io/en/stable/ |
| Kustomize | https://kubectl.docs.kubernetes.io/guides/introduction/kustomize/ |
| Helm | https://helm.sh/docs/ |
| Sealed Secrets | https://github.com/bitnami/sealed-secrets |
| External Secrets | https://external-secrets.io/latest/ |

### Fase 8 — Observabilidad

| Tema | Link |
|---|---|
| Prometheus | https://prometheus.io/docs/introduction/overview/ |
| Grafana | https://grafana.com/docs/ |
| OpenTelemetry | https://opentelemetry.io/docs/ |

---

## 3. Orden sugerido de lectura

1. **Pod, Deployment, Service, Namespace** → entender qué corre y cómo se expone.
2. **ConfigMap y Secret** → cómo inyectar variables (esto conecta con la Fase 2.5 de `.env`).
3. **Ingress + addon de Minikube** → cómo entra el tráfico de afuera.
4. **StatefulSet + PersistentVolume** → Postgres y Kafka con estado.
5. **Probes + requests/limits** → que el cluster no se caiga.
6. Recién después: Gateway, CI/CD y observabilidad.

---

## 4. Documentación propia del proyecto

| Archivo | Qué contiene |
|---|---|
| `README.md` | Plan de 8 fases y estado del proyecto |
| `~/.config/opencode/context/microservices-architecture-ecommerce-lab/plan-despliegue-devops.md` | Plan original y decisiones de arquitectura |
| `.../fase1-2-dockerfiles-compose-completo.md` | Cierre de Fase 1/2 + pendientes P1–P7 + Fase 2.5 |
| `.../revision-order-service-2026-10-31.md` | Revisión de order-service y estado actual |

> Regla del lab: primero se entiende el concepto, después se escribe el manifiesto.
> No copiar YAML sin saber qué hace cada campo.
