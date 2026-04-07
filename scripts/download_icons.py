import os
import urllib.request

icons = {
    "python": "https://raw.githubusercontent.com/devicons/devicon/master/icons/python/python-original.svg",
    "aws": "https://raw.githubusercontent.com/devicons/devicon/master/icons/amazonwebservices/amazonwebservices-original-wordmark.svg",
    "azure": "https://raw.githubusercontent.com/devicons/devicon/master/icons/azure/azure-original.svg",
    "docker": "https://raw.githubusercontent.com/devicons/devicon/master/icons/docker/docker-original.svg",
    "kubernetes": "https://raw.githubusercontent.com/devicons/devicon/master/icons/kubernetes/kubernetes-plain.svg",
    "gitlab": "https://raw.githubusercontent.com/devicons/devicon/master/icons/gitlab/gitlab-original.svg",
    "bash": "https://raw.githubusercontent.com/devicons/devicon/master/icons/bash/bash-original.svg",
    "sonarqube": "https://raw.githubusercontent.com/devicons/devicon/master/icons/sonarqube/sonarqube-original.svg",
    "yaml": "https://raw.githubusercontent.com/devicons/devicon/master/icons/yaml/yaml-original.svg",
    "defectdojo": "https://raw.githubusercontent.com/DefectDojo/django-DefectDojo/master/dojo/static/dojo/img/logo.svg",
    "grype": "https://raw.githubusercontent.com/anchore/grype/master/docs/images/grype-logo.svg",
    "semgrep": "https://raw.githubusercontent.com/semgrep/semgrep/main/assets/semgrep-logo.svg",
    "ansible": "https://raw.githubusercontent.com/devicons/devicon/master/icons/ansible/ansible-original.svg",
    "terraform": "https://raw.githubusercontent.com/devicons/devicon/master/icons/terraform/terraform-original.svg",
    "jenkins": "https://raw.githubusercontent.com/devicons/devicon/master/icons/jenkins/jenkins-original.svg",
    "linux": "https://raw.githubusercontent.com/devicons/devicon/master/icons/linux/linux-original.svg"
}

target_dir = "public/icons/skills"
os.makedirs(target_dir, exist_ok=True)

for name, url in icons.items():
    target_path = os.path.join(target_dir, f"{name}.svg")
    print(f"Downloading {name} from {url}...")
    try:
        urllib.request.urlretrieve(url, target_path)
        print(f"✓ Saved to {target_path}")
    except Exception as e:
        print(f"✗ Failed to download {name}: {e}")
