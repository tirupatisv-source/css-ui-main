{{/* vim: set filetype=mustache: */}}
{{/*
Expand the name of the chart.
*/}}
{{- define "css-ui.name" -}}
{{ printf "%s-%s" "css-ui" .Values.environment }}
{{- end -}}

{{- define "css-ui.fullname" -}}
{{ printf "%s-%s" "css-ui" .Values.environment }}
{{- end -}}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "css-ui.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Common labels
*/}}
{{- define "css-ui.labels" -}}
helm.sh/chart: {{ include "css-ui.chart" . }}
{{ include "css-ui.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

{{/*
Selector labels
*/}}
{{- define "css-ui.selectorLabels" -}}
app.kubernetes.io/name: css-ui-{{ .Values.environment }}
app.kubernetes.io/instance: css-ui-{{ .Values.environment }}
{{- end -}}

{{/*
Create the name of the service account to use
*/}}
{{- define "css-ui.serviceAccountName" -}}
{{- if .Values.serviceAccount.create -}}
    {{ default (include "css-ui.fullname" .) .Values.serviceAccount.name }}
{{- else -}}
    {{ .Values.serviceAccount.name }}
{{- end -}}
{{- end -}}
